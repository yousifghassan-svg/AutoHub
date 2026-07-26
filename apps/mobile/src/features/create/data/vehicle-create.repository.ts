import type { HttpClient } from '@/lib/api/http-client';
import { uploadMediaAsset } from './media-upload';
import { createJsonDraftStore } from './draft-store';
import type { VehicleDraft } from '../domain/vehicle-draft';
import type { CreateMediaItem } from '../domain/media';

const drafts = createJsonDraftStore<VehicleDraft>('autohub.create.vehicles.v1');

function buildPayload(draft: VehicleDraft) {
  const title =
    draft.title.trim() ||
    [draft.brandLabel, draft.modelLabel, draft.year].filter(Boolean).join(' ');
  const description =
    draft.description.trim() +
    (draft.negotiable ? '\n\nPrice is negotiable.' : '');

  return {
    categoryId: draft.categoryId!,
    cityId: draft.cityId!,
    title,
    description,
    language: 'ar' as const,
    primaryPrice: Number(draft.primaryPrice),
    currencyCode: draft.currencyCode || 'IQD',
    conditionTypeId: draft.conditionTypeId ?? undefined,
    vehicleDetails: {
      makeId: draft.brandId ?? undefined,
      modelId: draft.modelId ?? undefined,
      year: Number(draft.year) || undefined,
      mileageKm: draft.mileageKm ? Number(draft.mileageKm) : undefined,
      fuelTypeId: draft.fuelTypeId ?? undefined,
      transmissionTypeId: draft.transmissionTypeId ?? undefined,
      bodyTypeId: draft.bodyTypeId ?? undefined,
      driveTypeId: draft.driveTypeId ?? undefined,
      colorId: draft.colorId ?? undefined,
      engineTypeId: draft.engineTypeId ?? undefined,
      engineSizeCc: draft.engineSizeCc ? Number(draft.engineSizeCc) : undefined,
      vin: draft.vin.trim() || undefined,
    },
  };
}

/** Diff only changed scalar fields for PATCH. */
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

export type VehicleCreateRepository = {
  listDrafts(): Promise<VehicleDraft[]>;
  getDraft(localId: string): Promise<VehicleDraft | null>;
  saveDraftLocal(draft: VehicleDraft): Promise<VehicleDraft>;
  removeDraft(localId: string): Promise<void>;
  syncDraftRemote(draft: VehicleDraft, previousPayload?: Record<string, unknown> | null): Promise<VehicleDraft>;
  uploadAndAttachMedia(
    draft: VehicleDraft,
    item: CreateMediaItem,
    onProgress?: (p: number) => void,
  ): Promise<VehicleDraft>;
  reorderMedia(listingId: string, orderedIds: string[]): Promise<void>;
  deleteMedia(listingId: string, mediaId: string): Promise<void>;
  publish(draft: VehicleDraft): Promise<VehicleDraft>;
};

export function createVehicleCreateRepository(http: HttpClient): VehicleCreateRepository {
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

    async syncDraftRemote(draft, previousPayload = lastPayload) {
      const payload = buildPayload(draft);
      let listingId = draft.listingId;

      if (!listingId) {
        const created = await http.post<{ id: string }>('/v1/vehicles', payload, true);
        listingId = created.id;
        lastPayload = payload;
      } else {
        const patch = changedFields(previousPayload, payload);
        if (Object.keys(patch).length > 0) {
          await http.request(`/v1/vehicles/${listingId}`, {
            method: 'PATCH',
            body: patch,
          });
        }
        lastPayload = payload;
      }

      const next: VehicleDraft = {
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
              error: undefined,
            }
          : m,
      );
      const next = { ...draft, media, updatedAt: new Date().toISOString() };
      await drafts.save(next);
      return next;
    },

    async reorderMedia(listingId, orderedIds) {
      await http.request(`/v1/listings/${listingId}/media/reorder`, {
        method: 'PATCH',
        body: { orderedIds },
      });
    },

    async deleteMedia(listingId, mediaId) {
      await http.request(`/v1/listings/${listingId}/media/${mediaId}`, {
        method: 'DELETE',
      });
    },

    async publish(draft) {
      let next = draft;
      if (!next.listingId) next = await this.syncDraftRemote(next);
      for (const item of next.media) {
        if (item.uploadStatus !== 'attached') {
          next = await this.uploadAndAttachMedia(next, {
            ...item,
            uploadStatus: 'uploading',
            progress: 0,
          });
        }
      }
      await http.request(`/v1/vehicles/${next.listingId}/status`, {
        method: 'PATCH',
        body: { status: 'PENDING' },
      });
      const published: VehicleDraft = {
        ...next,
        status: 'pending',
        updatedAt: new Date().toISOString(),
      };
      await drafts.save(published);
      return published;
    },
  };
}

let repo: VehicleCreateRepository | null = null;

export function getVehicleCreateRepository(http?: HttpClient): VehicleCreateRepository {
  if (!repo) {
    if (!http) throw new Error('VehicleCreateRepository requires http on first init');
    repo = createVehicleCreateRepository(http);
  }
  return repo;
}
