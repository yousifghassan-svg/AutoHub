import { createEmptyDraft } from '../domain/draft-factory';
import { createMemoryDraftStore } from '../data/draft-store';
import { createMockSellRepository } from '../data/mock-sell.repository';

describe('mock sell repository', () => {
  function setup() {
    const drafts = createMemoryDraftStore();
    const repo = createMockSellRepository({ drafts });
    return { repo, drafts };
  }

  it('autosaves and resumes drafts', async () => {
    const { repo } = setup();
    const draft = createEmptyDraft({ title: 'كامري' });
    await repo.saveDraftLocal(draft);
    const listed = await repo.listDrafts();
    expect(listed[0]?.title).toBe('كامري');
    expect(await repo.getDraft(draft.localId)).not.toBeNull();
  });

  it('syncs remote draft id', async () => {
    const { repo } = setup();
    const draft = createEmptyDraft({
      categoryId: 'cat-car',
      cityId: 'city-baghdad',
      title: 'Test listing title',
      description: 'Description long enough',
    });
    const synced = await repo.syncDraftRemote(draft);
    expect(synced.listingId).toMatch(/^mock-listing-/);
    expect(synced.status).toBe('draft');
  });

  it('uploads media and submits for review', async () => {
    const { repo } = setup();
    let draft = createEmptyDraft({
      categoryId: 'cat-car',
      cityId: 'city-baghdad',
      title: 'Test listing title',
      description: 'Description long enough',
      media: [
        {
          localId: 'm1',
          kind: 'IMAGE',
          uri: 'file://a.jpg',
          mimeType: 'image/jpeg',
          byteSize: 12,
          filename: 'a.jpg',
          uploadStatus: 'pending',
        },
      ],
    });
    draft = await repo.submitForReview(draft);
    expect(draft.status).toBe('pending');
    expect(draft.media[0]?.uploadStatus).toBe('attached');
    expect(draft.step).toBe('submit');
  });
});
