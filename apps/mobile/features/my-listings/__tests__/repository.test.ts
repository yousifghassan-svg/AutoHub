import { createMemoryMyListingsCache } from '../data/my-listings-cache';
import { createMockMyListingsRepository } from '../data/my-listings.repository';

describe('mock my listings repository', () => {
  function setup() {
    const cache = createMemoryMyListingsCache();
    const repo = createMockMyListingsRepository({ cache });
    return { repo, cache };
  }

  it('filters by status tab and paginates', async () => {
    const { repo } = setup();
    const drafts = await repo.listMine({ tab: 'DRAFT', page: 1, pageSize: 20 });
    expect(drafts.items.every((x) => x.status === 'DRAFT')).toBe(true);

    const all = await repo.listMine({ tab: 'ALL', page: 1, pageSize: 2 });
    expect(all.items).toHaveLength(2);
    expect(all.totalPages).toBeGreaterThan(1);
  });

  it('marks as sold and archives', async () => {
    const { repo } = setup();
    const active = (await repo.listMine({ tab: 'ACTIVE', page: 1 })).items[0];
    const sold = await repo.changeStatus(active.id, 'SOLD');
    expect(sold.status).toBe('SOLD');
    expect(sold.soldAt).not.toBeNull();

    const archived = await repo.softDelete(sold.id);
    expect(archived.status).toBe('ARCHIVED');
  });

  it('edits, duplicates, and renews', async () => {
    const { repo } = setup();
    const active = (await repo.listMine({ tab: 'ACTIVE', page: 1 })).items[0];
    const edited = await repo.update(active.id, {
      title: 'Updated title',
      description: 'Updated description long enough',
      primaryPrice: 999,
    });
    expect(edited.title).toBe('Updated title');
    expect(edited.price).toBe(999);

    const copy = await repo.duplicate(edited);
    expect(copy.status).toBe('DRAFT');
    expect(copy.id).not.toBe(edited.id);

    const renewed = await repo.renew(edited);
    expect(renewed.status).toBe('DRAFT');
  });

  it('rejects illegal transitions', async () => {
    const { repo } = setup();
    const archived = (await repo.listMine({ tab: 'ARCHIVED', page: 1 })).items[0];
    await expect(repo.changeStatus(archived.id, 'ACTIVE')).rejects.toThrow(/Cannot transition/);
  });

  it('serves offline cache after first page', async () => {
    const { repo, cache } = setup();
    await repo.listMine({ tab: 'ACTIVE', page: 1 });
    const cached = await cache.get('ACTIVE');
    expect(cached?.length).toBeGreaterThan(0);
  });
});
