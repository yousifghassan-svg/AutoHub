'use client';

import { useCallback, useRef, useState } from 'react';
import { compressImage, isHeicFile } from '../lib/compress-image';
import { mediaRepository, uploadMediaFile } from '../data/media.repository';
import type { UploadFileState } from '../domain/types';

function localId() {
  return `local_${Math.random().toString(36).slice(2, 10)}`;
}

export function useMediaUpload(options?: {
  mediaType?: string;
  visibility?: 'PUBLIC' | 'PRIVATE';
  ownerModule?: string;
  ownerEntityId?: string;
  compress?: boolean;
}) {
  const [files, setFiles] = useState<UploadFileState[]>([]);
  const controllers = useRef(new Map<string, AbortController>());

  const update = useCallback((id: string, patch: Partial<UploadFileState>) => {
    setFiles((prev) => prev.map((f) => (f.localId === id ? { ...f, ...patch } : f)));
  }, []);

  const enqueue = useCallback((incoming: FileList | File[]) => {
    const list = Array.from(incoming);
    setFiles((prev) => {
      const next: UploadFileState[] = list.map((file, index) => ({
        localId: localId(),
        file,
        progress: 0,
        status: 'queued',
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        isPrimary: prev.length === 0 && index === 0,
      }));
      return [...prev, ...next];
    });
  }, []);

  const startOne = useCallback(
    async (item: UploadFileState) => {
      const controller = new AbortController();
      controllers.current.set(item.localId, controller);

      try {
        let file = item.file;
        if (options?.compress !== false && file.type.startsWith('image/')) {
          update(item.localId, { status: 'compressing' });
          const compressed = await compressImage(file);
          file = compressed.file;
          if (compressed.note) {
            update(item.localId, { error: compressed.note });
          }
        } else if (isHeicFile(file)) {
          update(item.localId, {
            error:
              'HEIC detected — browsers may not preview it. Upload proceeds with the original file.',
          });
        }

        update(item.localId, { status: 'uploading', progress: 0, file });
        const asset = await uploadMediaFile(file, {
          mediaType: options?.mediaType ?? 'IMAGE',
          visibility: options?.visibility ?? 'PUBLIC',
          ownerModule: options?.ownerModule,
          ownerEntityId: options?.ownerEntityId,
          signal: controller.signal,
          onProgress: (pct) => update(item.localId, { progress: pct, status: 'uploading' }),
        });

        update(item.localId, {
          status: 'done',
          progress: 100,
          asset,
          error: undefined,
        });
      } catch (e) {
        if (controller.signal.aborted) {
          update(item.localId, { status: 'cancelled', error: 'Cancelled' });
        } else {
          update(item.localId, {
            status: 'error',
            error: e instanceof Error ? e.message : 'Upload failed',
          });
        }
      } finally {
        controllers.current.delete(item.localId);
      }
    },
    [options?.compress, options?.mediaType, options?.ownerEntityId, options?.ownerModule, options?.visibility, update],
  );

  const startAll = useCallback(async () => {
    const queued = files.filter((f) => f.status === 'queued' || f.status === 'error');
    for (const item of queued) {
      await startOne(item);
    }
  }, [files, startOne]);

  const retry = useCallback(
    (localId: string) => {
      const item = files.find((f) => f.localId === localId);
      if (!item) return;
      update(localId, { status: 'queued', progress: 0, error: undefined });
      void startOne({ ...item, status: 'queued', progress: 0, error: undefined });
    },
    [files, startOne, update],
  );

  const cancel = useCallback((localId: string) => {
    controllers.current.get(localId)?.abort();
    update(localId, { status: 'cancelled', error: 'Cancelled' });
  }, [update]);

  const remove = useCallback((id: string) => {
    controllers.current.get(id)?.abort();
    setFiles((prev) => {
      const target = prev.find((f) => f.localId === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      const next = prev.filter((f) => f.localId !== id);
      if (target?.isPrimary && next[0]) {
        return next.map((f, i) => ({ ...f, isPrimary: i === 0 }));
      }
      return next;
    });
  }, []);

  const setPrimary = useCallback((id: string) => {
    setFiles((prev) =>
      prev.map((f) => ({ ...f, isPrimary: f.localId === id })),
    );
  }, []);

  const reorder = useCallback((fromIndex: number, toIndex: number) => {
    setFiles((prev) => {
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= prev.length ||
        toIndex >= prev.length
      ) {
        return prev;
      }
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      if (!moved) return prev;
      next.splice(toIndex, 0, moved);
      return next.map((f, i) => ({ ...f, isPrimary: i === 0 }));
    });
  }, []);

  const replace = useCallback(
    async (localId: string, nextFile: File) => {
      const item = files.find((f) => f.localId === localId);
      if (!item?.asset?.id) return;
      const controller = new AbortController();
      controllers.current.set(localId, controller);
      try {
        update(localId, {
          status: 'uploading',
          progress: 0,
          file: nextFile,
          previewUrl: nextFile.type.startsWith('image/')
            ? URL.createObjectURL(nextFile)
            : item.previewUrl,
          error: undefined,
        });
        const asset = await mediaRepository.replaceMultipart(
          item.asset.id,
          nextFile,
          controller.signal,
          (pct) => update(localId, { progress: pct }),
        );
        update(localId, { status: 'done', progress: 100, asset, file: nextFile });
      } catch (e) {
        update(localId, {
          status: 'error',
          error: e instanceof Error ? e.message : 'Replace failed',
        });
      } finally {
        controllers.current.delete(localId);
      }
    },
    [files, update],
  );

  return {
    files,
    enqueue,
    startAll,
    startOne,
    retry,
    cancel,
    remove,
    setPrimary,
    reorder,
    replace,
  };
}
