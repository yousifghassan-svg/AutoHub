import type { WizardDraft, WizardMediaItem } from '../domain/types';
import type { DraftStore } from './draft-store';
import type { SellRepository } from './sell.repository.types';

export function createMockSellRepository(deps: { drafts: DraftStore }): SellRepository {
  const { drafts } = deps;
  let listingSeq = 1;

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
      const listingId = draft.listingId ?? `mock-listing-${listingSeq++}`;
      const next: WizardDraft = {
        ...draft,
        listingId,
        status: 'draft',
        updatedAt: new Date().toISOString(),
      };
      await drafts.save(next);
      return next;
    },

    async uploadAndAttachMedia(_draft: WizardDraft, item: WizardMediaItem) {
      await new Promise((r) => setTimeout(r, 50));
      return {
        ...item,
        assetId: `asset-${item.localId}`,
        r2Key: `mock/${item.filename}`,
        listingMediaId: `lm-${item.localId}`,
        uploadStatus: 'attached' as const,
      };
    },

    async submitForReview(draft) {
      let current = await this.syncDraftRemote(draft);
      const media = [];
      for (const m of current.media) {
        media.push(
          m.uploadStatus === 'attached' ? m : await this.uploadAndAttachMedia(current, m),
        );
      }
      current = {
        ...current,
        media,
        status: 'pending',
        step: 'submit',
        updatedAt: new Date().toISOString(),
      };
      await drafts.save(current);
      return current;
    },
  };
}
