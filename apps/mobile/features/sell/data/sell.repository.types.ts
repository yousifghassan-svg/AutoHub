import type { WizardDraft, WizardMediaItem } from '../domain/types';

export type SellRepository = {
  listDrafts(): Promise<WizardDraft[]>;
  getDraft(localId: string): Promise<WizardDraft | null>;
  saveDraftLocal(draft: WizardDraft): Promise<WizardDraft>;
  removeDraft(localId: string): Promise<void>;
  syncDraftRemote(draft: WizardDraft): Promise<WizardDraft>;
  uploadAndAttachMedia(draft: WizardDraft, item: WizardMediaItem): Promise<WizardMediaItem>;
  submitForReview(draft: WizardDraft): Promise<WizardDraft>;
};
