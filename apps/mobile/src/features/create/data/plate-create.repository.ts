import type { HttpClient } from '@/lib/api/http-client';
import { uploadMediaAsset } from './media-upload';
import { createJsonDraftStore } from './draft-store';
import type { PlateDraft } from '../domain/plate-draft';
import type { CreateMediaItem } from '../domain/media';

const drafts = createJsonDraftStore<PlateDraft>('autohub.create.plates.v1');

function buildPayload(draft: PlateDraft) {
  const display = `${draft.regionCode} ${draft.series} ${draft.number}`.trim();
  const title = draft.title.trim() || display;
  const description =
    draft.description.trim() + (draft.negotiable ? '\n\nPrice is negotiable.' : '');

  return {
    categoryId: draft.categoryId!,
    cityId: draft.cityId!,
    title,
    description,
    language: 'ar' as const,
    primaryPrice: Number(draft.primaryPrice),
    currencyCode: draft.currencyCode || 'IQD',
    formatCode: draft.formatCode!,
    regionCode: draft.regionCode.trim(),
    series: draft.series.trim().toUpperCase(),
    number: draft.number.trim(),
    plateCategoryId: draft.plateCategoryId ?? undefined,
    platePrefixId: draft.platePrefixId ?? undefined,
    plateType: draft.plateCategoryLabel || undefined,
  };
}

function changedFields(
  prev: Record<string, unknown> | null,
  next: Record<string, unknown>,
): Record<string, unknown> {
  if (!prev) return next;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(next)) {
    if (JSON.stringify(prev[k]) !== JSON.stringify(v)) out[k] = v;
  }
  return out;
}

export type PlateCreateRepository = {
  listDrafts(): Promise<PlateDraft[]>;
  getDraft(localId: string): Promise<PlateDraft | null>;
  saveDraftLocal(draft: PlateDraft): Promise<PlateDraft>;
  removeDraft(localId: string): Promise<void>;
  syncDraftRemote(draft: PlateDraft): Promise<PlateDraft>;
  uploadAndAttachMedia(
    draft: PlateDraft,
    item: CreateMediaItem,
    onProgress?: (p: number) => void,
  ): Promise<PlateDraft>;
  publish(draft: PlateDraft): Promise<PlateDraft>;
};

export function createPlateCreateRepository(http: HttpClient): PlateCreateRepository {
  let lastPayload: Record<string, unknown> | null = null;

  return {
    listDrafts: () => drafts.list(),
    getDraft: (id) => drafts.get(id),
    async saveDraftLocal(draft) {
      const next = { ...draft, updatedAt: new Date().toISOString() };
      await drafts.save(next);
      return next;
    },
    removeDraft: (id) => drafts.remove(id),

    async syncDraftRemote(draft) {
      const payload = buildPayload(draft);
      let listingId = draft.listingId;
      if (!listingId) {
        const created = await http.post<{ id: string }>('/v1/plates', payload, true);
        listingId = created.id;
        lastPayload = payload;
      } else {
        const patch = changedFields(lastPayload, payload as Record<string, unknown>);
        // categoryId is immutable on update for plates — omit if present
        delete patch.categoryId;
        delete patch.language;
        if (Object.keys(patch).length > 0) {
          await http.request(`/v1/plates/${listingId}`, {
            method: 'PATCH',
            body: patch,
          });
        }
        lastPayload = payload;
      }
      const next: PlateDraft = {
        ...draft,
        listingId,
        status: 'draft',
        updatedAt: new Date().toISOString(),
      };
      await drafts.save(next);
      return next;
    },

    async uploadAndAttachMedia(draft, item, onProgress) {
      if (!draft.listingId) throw new Error('Sync draft before uploading media');
      const uploaded = await uploadMediaAsset(item, draft.listingId, {
        onProgress,
        compress: true,
      });
      const attached = await http.post<{ id: string }>(
        `/v1/listings/${draft.listingId}/media`,
        {
          mediaAssetId: uploaded.assetId,
          mediaType: item.kind,
          sortOrder: draft.media.findIndex((m) => m.localId === item.localId),
        },
        true,
      );
      const media = draft.media.map((m) =>
        m.localId === item.localId
          ? {
              ...m,
              assetId: uploaded.assetId,
              r2Key: uploaded.originalKey,
              listingMediaId: attached.id,
              uploadStatus: 'attached' as const,
              progress: 1,
            }
          : m,
      );
      const next = { ...draft, media, updatedAt: new Date().toISOString() };
      await drafts.save(next);
      return next;
    },

    async publish(draft) {
      let next = draft.listingId ? draft : await this.syncDraftRemote(draft);
      for (const item of next.media) {
        if (item.uploadStatus !== 'attached') {
          next = await this.uploadAndAttachMedia(next, item);
        }
      }
      await http.request(`/v1/plates/${next.listingId}/status`, {
        method: 'PATCH',
        body: { status: 'PENDING' },
      });
      const published: PlateDraft = {
        ...next,
        status: 'pending',
        updatedAt: new Date().toISOString(),
      };
      await drafts.save(published);
      return published;
    },
  };
}

let repo: PlateCreateRepository | null = null;

export function getPlateCreateRepository(http?: HttpClient): PlateCreateRepository {
  if (!repo) {
    if (!http) throw new Error('PlateCreateRepository requires http on first init');
    repo = createPlateCreateRepository(http);
  }
  return repo;
}
