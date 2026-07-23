import { createMockHomeRepository } from '../data/home.repository';
import { createMemoryRecentlyViewedStore } from '../data/recently-viewed.storage';
import { MOCK_LISTINGS } from '../data/mock-home-data';

describe('createMockHomeRepository', () => {
  function setup() {
    const recentlyViewed = createMemoryRecentlyViewedStore();
    const repo = createMockHomeRepository({ recentlyViewed });
    return { repo, recentlyViewed };
  }

  it('returns featured listings', async () => {
    const { repo } = setup();
    const featured = await repo.getFeatured();
    expect(featured.every((x) => x.isFeatured)).toBe(true);
    expect(featured.length).toBeGreaterThan(0);
  });

  it('paginates latest listings', async () => {
    const { repo } = setup();
    const page1 = await repo.getLatest(1, 2);
    expect(page1.items).toHaveLength(2);
    expect(page1.totalPages).toBeGreaterThan(1);
    const page2 = await repo.getLatest(2, 2);
    expect(page2.items[0].id).not.toBe(page1.items[0].id);
  });

  it('filters by category', async () => {
    const { repo } = setup();
    const page = await repo.getListings({ categoryCode: 'PLATE', page: 1, pageSize: 20 });
    expect(page.items.every((x) => x.categoryCode === 'PLATE')).toBe(true);
  });

  it('exposes trending categories and recent searches', async () => {
    const { repo } = setup();
    const trending = await repo.getTrending();
    expect(trending.categories.length).toBeGreaterThan(0);
    const recent = await repo.getRecentSearches();
    expect(recent.length).toBeGreaterThan(0);
  });

  it('records recently viewed listings', async () => {
    const { repo } = setup();
    await repo.recordView(MOCK_LISTINGS[0]);
    await repo.recordView(MOCK_LISTINGS[1]);
    await repo.recordView(MOCK_LISTINGS[0]);
    const viewed = await repo.getRecentlyViewed();
    expect(viewed[0].id).toBe(MOCK_LISTINGS[0].id);
    expect(viewed).toHaveLength(2);
  });
});
