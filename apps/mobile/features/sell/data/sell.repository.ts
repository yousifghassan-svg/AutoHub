import type { HttpClient } from '@/lib/api/http-client';
import { MOCK_CURRENCY_IDS } from './catalog';
import { uploadMediaAsset } from './media-upload';
import type { CreateListingPayload, WizardDraft } from '../domain/types';
import type { DraftStore } from './draft-store';
import type { SellRepository } from './sell.repository.types';

export type { SellRepository } from './sell.repository.types';
export { createMockSellRepository } from './mock-sell.repository';

function toCreatePayload(draft: WizardDraft): CreateListingPayload {
  const year = draft.vehicleDetails.year ? Number(draft.vehicleDetails.year) : undefined;
  const mileageKm = draft.vehicleDetails.mileageKm
    ? Number(draft.vehicleDetails.mileageKm)
    : undefined;
  const engineSizeCc = draft.vehicleDetails.engineSizeCc
    ? Number(draft.vehicleDetails.engineSizeCc)
    : undefined;
  const doors = draft.vehicleDetails.doors ? Number(draft.vehicleDetails.doors) : undefined;
  const primaryPrice = draft.primaryPrice ? Number(draft.primaryPrice) : undefined;

  const vehicleDetails =
    draft.categoryCode === 'CAR' ||
    draft.categoryCode === 'MOTORCYCLE' ||
    draft.categoryCode === 'TRUCK'
      ? {
          brandId: draft.vehicleDetails.brandId ?? undefined,
          modelId: draft.vehicleDetails.modelId ?? undefined,
          year,
          mileageKm,
          engineSizeCc,
          doors,
        }
      : undefined;

  return {
    categoryId: draft.categoryId!,
    cityId: draft.cityId!,
    title: draft.title.trim(),
    description: draft.description.trim(),
    language: draft.language,
    primaryPrice,
    primaryCurrencyId:
      draft.primaryCurrencyId ??
      (draft.currencyCode === 'USD' ? MOCK_CURRENCY_IDS.USD : MOCK_CURRENCY_IDS.IQD),
    conditionTypeId: draft.conditionTypeId ?? undefined,
    vehicleDetails,
  };
}

type ListingApi = { id: string; status: string };

export function createApiSellRepository(deps: {
  http: HttpClient;
  drafts: DraftStore;
}): SellRepository {
  const { http, drafts } = deps;

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
      const payload = toCreatePayload(draft);
      let listingId = draft.listingId;
      const status: WizardDraft['status'] = 'draft';

      if (!listingId) {
        const created = await http.post<ListingApi>('/v1/listings', {
          categoryId: payload.categoryId,
          cityId: payload.cityId,
          title: payload.title,
          description: payload.description,
          language: payload.language,
          primaryPrice: payload.primaryPrice,
          primaryCurrencyId: payload.primaryCurrencyId,
          conditionTypeId: payload.conditionTypeId,
          vehicleDetails: payload.vehicleDetails,
          carDetails: payload.vehicleDetails,
        });
        listingId = created.id;
      } else {
        await http.request(`/v1/listings/${listingId}`, {
          method: 'PATCH',
          body: {
            cityId: payload.cityId,
            title: payload.title,
            description: payload.description,
            language: payload.language,
            primaryPrice: payload.primaryPrice,
            primaryCurrencyId: payload.primaryCurrencyId,
            conditionTypeId: payload.conditionTypeId,
            vehicleDetails: payload.vehicleDetails,
            carDetails: payload.vehicleDetails,
          },
        });
      }

      const next: WizardDraft = {
        ...draft,
        listingId,
        status,
        updatedAt: new Date().toISOString(),
      };
      await drafts.save(next);
      return next;
    },

    async uploadAndAttachMedia(draft, item) {
      if (!draft.listingId) {
        throw new Error('Sync draft to server before uploading media');
      }

      const uploaded = await uploadMediaAsset(item, draft.listingId);

      const attached = await http.post<{ id: string }>(
        `/v1/listings/${draft.listingId}/media`,
        {
          mediaType: item.kind === '360_MEDIA' ? '360_MEDIA' : item.kind,
          r2Key: uploaded.originalKey,
          mimeType: item.mimeType,
          byteSize: item.byteSize,
          confirmed: true,
        },
      );

      return {
        ...item,
        assetId: uploaded.assetId,
        r2Key: uploaded.originalKey,
        listingMediaId: attached.id,
        uploadStatus: 'attached',
      };
    },

    async submitForReview(draft) {
      let current = await this.syncDraftRemote(draft);

      for (const media of current.media) {
        if (media.uploadStatus !== 'attached') {
          try {
            const uploaded = await this.uploadAndAttachMedia(current, {
              ...media,
              uploadStatus: 'uploading',
            });
            current = {
              ...current,
              media: current.media.map((m) => (m.localId === media.localId ? uploaded : m)),
            };
            await drafts.save(current);
          } catch (e) {
            const message = e instanceof Error ? e.message : 'Upload failed';
            current = {
              ...current,
              media: current.media.map((m) =>
                m.localId === media.localId
                  ? { ...m, uploadStatus: 'failed' as const, error: message }
                  : m,
              ),
            };
            await drafts.save(current);
            throw e;
          }
        }
      }

      await http.request(`/v1/listings/${current.listingId}/status`, {
        method: 'PATCH',
        body: { status: 'PENDING' },
      });

      const next: WizardDraft = {
        ...current,
        status: 'pending',
        step: 'submit',
        updatedAt: new Date().toISOString(),
      };
      await drafts.save(next);
      return next;
    },
  };
}
