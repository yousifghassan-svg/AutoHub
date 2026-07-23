import { createHttpClient } from '../http-client';
import { ApiError } from '../types';

describe('createHttpClient', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('throws offline error when isOnline is false', async () => {
    const client = createHttpClient({
      baseUrl: 'http://example.test',
      getTokens: async () => null,
      onTokensRefreshed: async () => undefined,
      onAuthFailure: async () => undefined,
      isOnline: async () => false,
    });

    await expect(client.get('/v1/auth/me')).rejects.toMatchObject({
      code: 'OFFLINE',
      offline: true,
    } satisfies Partial<ApiError>);
  });

  it('unwraps success envelope', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { id: 'u1' },
        meta: { requestId: 'r1', timestamp: new Date().toISOString() },
      }),
    }) as unknown as typeof fetch;

    const client = createHttpClient({
      baseUrl: 'http://example.test',
      getTokens: async () => ({ accessToken: 'a', refreshToken: 'r' }),
      onTokensRefreshed: async () => undefined,
      onAuthFailure: async () => undefined,
      isOnline: async () => true,
    });

    await expect(client.get<{ id: string }>('/v1/auth/me')).resolves.toEqual({ id: 'u1' });
  });

  it('refreshes once on 401 then retries', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          error: { statusCode: 401, message: 'Unauthorized' },
          meta: { requestId: 'r1', timestamp: new Date().toISOString() },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            accessToken: 'new-a',
            refreshToken: 'new-r',
            expiresIn: 900,
            tokenType: 'Bearer',
            user: { id: 'u1' },
          },
          meta: { requestId: 'r2', timestamp: new Date().toISOString() },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { id: 'u1' },
          meta: { requestId: 'r3', timestamp: new Date().toISOString() },
        }),
      });

    global.fetch = fetchMock as unknown as typeof fetch;

    const onTokensRefreshed = jest.fn();
    const client = createHttpClient({
      baseUrl: 'http://example.test',
      getTokens: async () => ({ accessToken: 'old-a', refreshToken: 'old-r' }),
      onTokensRefreshed,
      onAuthFailure: async () => undefined,
      isOnline: async () => true,
    });

    await expect(client.get<{ id: string }>('/v1/auth/me')).resolves.toEqual({ id: 'u1' });
    expect(onTokensRefreshed).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: 'new-a', refreshToken: 'new-r' }),
    );
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
