import { uploadMediaAsset } from '../data/media-upload';

jest.mock('@/lib/config', () => ({
  config: { apiUrl: 'https://api.test' },
}));

jest.mock('@/features/auth/data/token-storage', () => ({
  createSecureTokenStorage: () => ({
    load: async () => ({ accessToken: 'tok' }),
  }),
}));

describe('uploadMediaAsset', () => {
  const item = {
    localId: 'm1',
    uri: 'file://photo.jpg',
    filename: 'photo.jpg',
    mimeType: 'image/jpeg',
    kind: 'IMAGE' as const,
    byteSize: 1000,
    uploadStatus: 'pending' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retries transient 503 then succeeds', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({ success: false, error: { message: 'busy' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { id: 'asset-1', originalKey: 'k1' },
        }),
      });
    global.fetch = fetchMock as never;

    const result = await uploadMediaAsset(item, 'listing-1', { maxAttempts: 3 });
    expect(result.assetId).toBe('asset-1');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not retry permanent 400', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ success: false, error: { message: 'bad file' } }),
    });
    global.fetch = fetchMock as never;

    await expect(uploadMediaAsset(item, 'listing-1', { maxAttempts: 3 })).rejects.toThrow(
      'bad file',
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
