import { MediaService } from './media.service';
import { MediaVisibility, MediaAssetStatus } from '@autohub/database';

describe('MediaService', () => {
  const assets = {
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAny: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    upsertVariant: jest.fn(),
    listForOwner: jest.fn(),
    listAdmin: jest.fn(),
  };
  const validation = {
    assertMediaType: jest.fn((v: string) => v.toUpperCase()),
    assertMimeAndSize: jest.fn(),
    buildObjectKey: jest.fn(() => 'media/image/u1/a1/file.jpg'),
  };
  const r2 = {
    isConfigured: jest.fn(() => false),
    putObject: jest.fn(),
    deleteObject: jest.fn(),
    createPresignedUploadUrl: jest.fn(),
    createPresignedDownloadUrl: jest.fn(),
    getPublicUrl: jest.fn(),
    getObjectBuffer: jest.fn(),
  };
  const images = {
    process: jest.fn(async () => ({
      width: 100,
      height: 80,
      blurDataUrl: 'data:image/jpeg;base64,abc',
      variants: [
        {
          kind: 'THUMBNAIL',
          buffer: Buffer.from('thumb'),
          mimeType: 'image/jpeg',
          width: 50,
          height: 40,
          byteSize: 5,
        },
      ],
    })),
  };
  const videos = {
    extractMetadata: jest.fn(async () => ({ durationSeconds: 12 })),
    extractPoster: jest.fn(async () => null),
  };
  const virusScanner = {
    scan: jest.fn(async (): Promise<{ status: 'CLEAN' | 'INFECTED' | 'SKIPPED' | 'FAILED' }> => ({
      status: 'SKIPPED',
    })),
  };

  const service = new MediaService(
    assets as never,
    validation as never,
    r2 as never,
    images as never,
    videos as never,
    virusScanner as never,
  );

  const user = {
    id: 'u1',
    role: 'USER' as const,
    permissions: [],
    firebaseUid: null,
    phone: null,
    email: null,
    displayName: null,
    status: 'ACTIVE',
  };

  beforeEach(() => jest.clearAllMocks());

  it('presigns upload and returns signed mode or server_upload_required', async () => {
    assets.create.mockResolvedValue({
      id: 'a1',
      mediaType: 'IMAGE',
      visibility: MediaVisibility.PRIVATE,
      status: MediaAssetStatus.PENDING_UPLOAD,
      originalKey: 'media/image/u1/a1/file.jpg',
      filename: 'file.jpg',
      mimeType: 'image/jpeg',
      byteSize: 10,
      checksumSha256: null,
      width: null,
      height: null,
      durationSeconds: null,
      ownerModule: null,
      ownerEntityId: null,
      virusScanStatus: 'PENDING',
      processingError: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      variants: [],
    });

    const result = await service.presign(user, {
      mediaType: 'IMAGE',
      mimeType: 'image/jpeg',
      byteSize: 10,
      filename: 'file.jpg',
    });

    expect(result.upload.mode).toBe('server_upload_required');
    expect(result.asset.status).toBe(MediaAssetStatus.PENDING_UPLOAD);
  });

  it('uploads image, scans, and processes variants', async () => {
    const created = {
      id: 'a1',
      mediaType: 'IMAGE',
      visibility: MediaVisibility.PRIVATE,
      status: MediaAssetStatus.PROCESSING,
      originalKey: 'media/image/u1/a1/file.jpg',
      filename: 'file.jpg',
      mimeType: 'image/jpeg',
      byteSize: 4,
      checksumSha256: null,
      width: null,
      height: null,
      durationSeconds: null,
      ownerModule: 'listings',
      ownerEntityId: 'L1',
      virusScanStatus: 'SKIPPED',
      processingError: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      variants: [],
    };
    assets.create.mockResolvedValue(created);
    assets.upsertVariant.mockResolvedValue({});
    assets.update.mockResolvedValue({
      ...created,
      status: MediaAssetStatus.READY,
      width: 100,
      height: 80,
      variants: [],
    });

    const result = await service.upload(user, {
      mediaType: 'IMAGE',
      mimeType: 'image/jpeg',
      filename: 'file.jpg',
      buffer: Buffer.from('jpeg'),
      ownerModule: 'listings',
      ownerEntityId: 'L1',
    });

    expect(virusScanner.scan).toHaveBeenCalled();
    expect(images.process).toHaveBeenCalled();
    expect(result.status).toBe(MediaAssetStatus.READY);
  });

  it('rejects infected uploads', async () => {
    virusScanner.scan.mockResolvedValueOnce({ status: 'INFECTED' });
    await expect(
      service.upload(user, {
        mediaType: 'IMAGE',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('x'),
      }),
    ).rejects.toThrow('virus');
  });
});
