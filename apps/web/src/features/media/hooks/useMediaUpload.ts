'use client';

import { useCallback, useRef, useState } from 'react';
import { compressImage, isHeicFile } from '../lib/compress-image';
import { validateClientMediaFile } from '../lib/client-media-validation';
import { mediaRepository, uploadMediaFile } from '../data/media.repository';
import type { MediaAsset, UploadFileState } from '../domain/types';

function localId() {
  return `local_${Math.random().toString(36).slice(2, 10)}`;
}

function placeholderFile(asset: MediaAsset): File {
  return new File([], asset.filename ?? 'media', {
    type: asset.mimeType || 'application/octet-stream',
  });
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

  const enqueue = useCallback(
    (incoming: FileList | File[]) => {
      const list = Array.from(incoming);
      const mediaType = options?.mediaType ?? 'IMAGE';
      setFiles((prev) => {
        const next: UploadFileState[] = list.map((file) => {
          const validation = validateClientMediaFile(file, mediaType);
          return {
            localId: localId(),
            file,
            progress: 0,
            status: validation.ok ? 'queued' : 'error',
            error: validation.ok ? undefined : validation.error,
            previewUrl: file.type.startsWith('image/')
              ? URL.createObjectURL(file)
              : undefined,
            isPrimary: false,
          };
        });
        const merged = [...prev, ...next];
        if (!merged.some((f) => f.isPrimary) && merged[0]) {
          return merged.map((f, i) => ({ ...f, isPrimary: i === 0 }));
        }
        return merged;
      });
    },
    [options?.mediaType],
  );

  const hydrateFromAssets = useCallback((assets: MediaAsset[]) => {
    if (!assets.length) return;
    setFiles((prev) => {
      if (prev.length) return prev;
      return assets.map((asset, index) => ({
        localId: `hydrated_${asset.id}`,
        file: placeholderFile(asset),
        progress: 100,
        status: 'done' as const,
        asset,
        previewUrl: asset.urls?.thumbnail ?? asset.urls?.small ?? undefined,
        isPrimary: index === 0,
      }));
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
      const validation = validateClientMediaFile(
        item.file,
        options?.mediaType ?? 'IMAGE',
      );
      if (!validation.ok) {
        update(item.localId, { status: 'error', error: validation.error });
        continue;
      }
      await startOne(item);
    }
  }, [files, options?.mediaType, startOne, update]);

  const retry = useCallback(
    (id: string) => {
      const item = files.find((f) => f.localId === id);
      if (!item) return;
      update(id, { status: 'queued', progress: 0, error: undefined });
      void startOne({ ...item, status: 'queued', progress: 0, error: undefined });
    },
    [files, startOne, update],
  );

  const cancel = useCallback((id: string) => {
    controllers.current.get(id)?.abort();
    update(id, { status: 'cancelled', error: 'Cancelled' });
  }, [update]);

  const remove = useCallback((id: string) => {
    controllers.current.get(id)?.abort();
    setFiles((prev) => {
      const target = prev.find((f) => f.localId === id);
      if (target?.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(target.previewUrl);
      }
      const next = prev.filter((f) => f.localId !== id);
      if (target?.isPrimary && next[0]) {
        return next.map((f, i) => ({ ...f, isPrimary: i === 0 }));
      }
      return next;
    });
  }, []);

  /** Cover media: move to index 0 so attach order matches sortOrder 0. */
  const setPrimary = useCallback((id: string) => {
    setFiles((prev) => {
      const idx = prev.findIndex((f) => f.localId === id);
      if (idx < 0) return prev;
      if (idx === 0) {
        return prev.map((f, i) => ({ ...f, isPrimary: i === 0 }));
      }
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      if (!item) return prev;
      next.unshift(item);
      return next.map((f, i) => ({ ...f, isPrimary: i === 0 }));
    });
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
    async (id: string, nextFile: File) => {
      const item = files.find((f) => f.localId === id);
      if (!item?.asset?.id) return;

      const validation = validateClientMediaFile(
        nextFile,
        options?.mediaType ?? 'IMAGE',
      );
      if (!validation.ok) {
        update(id, { status: 'error', error: validation.error });
        return;
      }

      const controller = new AbortController();
      controllers.current.set(id, controller);
      try {
        if (item.previewUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(item.previewUrl);
        }
        update(id, {
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
          (pct) => update(id, { progress: pct }),
        );
        update(id, { status: 'done', progress: 100, asset, file: nextFile });
      } catch (e) {
        update(id, {
          status: 'error',
          error: e instanceof Error ? e.message : 'Replace failed',
        });
      } finally {
        controllers.current.delete(id);
      }
    },
    [files, options?.mediaType, update],
  );

  return {
    files,
    enqueue,
    hydrateFromAssets,
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
