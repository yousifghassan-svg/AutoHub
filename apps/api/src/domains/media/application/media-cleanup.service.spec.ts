import { MediaAssetStatus } from '@autohub/database';
import { MediaCleanupService } from './media-cleanup.service';

describe('MediaCleanupService', () => {
  const assets = {
    findStalePendingUploads: jest.fn(),
    findSoftDeletedForCleanup: jest.fn(),
    update: jest.fn(),
  };
  const r2 = {
    deleteObject: jest.fn().mockResolvedValue(undefined),
  };

  const service = new MediaCleanupService(assets as never, r2 as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reaps stale pending uploads', async () => {
    assets.findStalePendingUploads.mockResolvedValue([
      { id: 'a1', originalKey: 'pending/key', variants: [] },
    ]);
    assets.findSoftDeletedForCleanup.mockResolvedValue([]);

    const result = await service.runCleanup();

    expect(result.stalePending).toBe(1);
    expect(r2.deleteObject).toHaveBeenCalledWith('pending/key');
    expect(assets.update).toHaveBeenCalledWith(
      'a1',
      expect.objectContaining({ status: MediaAssetStatus.DELETED }),
    );
  });
});
