import { createMemoryDetailCache } from '../data/detail-cache';
import { createMockListingDetailRepository } from '../data/listing-detail.repository';

describe('mock listing detail repository', () => {
  function setup() {
    const cache = createMemoryDetailCache();
    const repo = createMockListingDetailRepository({ cache });
    return { repo, cache };
  }

  it('loads detail and caches it', async () => {
    const { repo, cache } = setup();
    const detail = await repo.getById('lst-1');
    expect(detail.title).toContain('كامري');
    expect(await cache.get('lst-1')).not.toBeNull();
  });

  it('returns related media from listing detail', async () => {
    const { repo } = setup();
    const media = await repo.getMedia('lst-1');
    expect(media.length).toBeGreaterThan(1);
    expect(media.some((m) => m.kind === 'VIDEO')).toBe(true);
    expect(media.some((m) => m.kind === '360_MEDIA')).toBe(true);
  });

  it('returns similar listings excluding self', async () => {
    const { repo } = setup();
    const detail = await repo.getById('lst-1');
    const similar = await repo.getSimilar(detail);
    expect(similar.every((x) => x.id !== 'lst-1')).toBe(true);
  });

  it('queues reports locally', async () => {
    const { repo } = setup();
    await expect(repo.reportListing('lst-1', 'Spam')).resolves.toEqual({ queued: true });
  });

  it('throws for unknown listing', async () => {
    const { repo } = setup();
    await expect(repo.getById('missing')).rejects.toMatchObject({ statusCode: 404 });
  });
});
