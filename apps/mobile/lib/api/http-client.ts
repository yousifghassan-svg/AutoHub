import { config } from '../config';
import { ApiError, type ApiErrorBody, type ApiSuccessResponse } from './types';

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type HttpClientOptions = {
  baseUrl?: string;
  getTokens: () => Promise<TokenPair | null>;
  onTokensRefreshed: (tokens: TokenPair & { expiresIn: number }) => Promise<void>;
  onAuthFailure: () => Promise<void>;
  isOnline?: () => Promise<boolean>;
};

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  skipRefresh?: boolean;
};

let refreshInFlight: Promise<boolean> | null = null;

export function createHttpClient(options: HttpClientOptions) {
  const baseUrl = options.baseUrl ?? config.apiUrl;

  async function refreshTokens(): Promise<boolean> {
    if (refreshInFlight) return refreshInFlight;

    refreshInFlight = (async () => {
      const tokens = await options.getTokens();
      if (!tokens?.refreshToken) return false;

      try {
        const res = await fetch(`${baseUrl}/v1/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ refreshToken: tokens.refreshToken }),
        });
        const json = (await res.json()) as ApiSuccessResponse<{
          accessToken: string;
          refreshToken: string;
          expiresIn: number;
        }> | ApiErrorBody;

        if (!res.ok || !json.success) {
          await options.onAuthFailure();
          return false;
        }

        await options.onTokensRefreshed({
          accessToken: json.data.accessToken,
          refreshToken: json.data.refreshToken,
          expiresIn: json.data.expiresIn,
        });
        return true;
      } catch {
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();

    return refreshInFlight;
  }

  async function request<T>(path: string, req: RequestOptions = {}): Promise<T> {
    const online = options.isOnline ? await options.isOnline() : true;
    if (!online) {
      throw new ApiError({
        message: 'You appear to be offline. Check your connection and try again.',
        statusCode: 0,
        code: 'OFFLINE',
        offline: true,
      });
    }

    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (req.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    if (req.auth !== false) {
      const tokens = await options.getTokens();
      if (tokens?.accessToken) {
        headers.Authorization = `Bearer ${tokens.accessToken}`;
      }
    }

    let res: Response;
    try {
      res = await fetch(`${baseUrl}${path}`, {
        method: req.method ?? (req.body !== undefined ? 'POST' : 'GET'),
        headers,
        body: req.body !== undefined ? JSON.stringify(req.body) : undefined,
      });
    } catch {
      throw new ApiError({
        message: 'Network request failed. Please try again.',
        statusCode: 0,
        code: 'NETWORK',
        offline: true,
      });
    }

    if (res.status === 401 && req.auth !== false && !req.skipRefresh) {
      const refreshed = await refreshTokens();
      if (refreshed) {
        return request<T>(path, { ...req, skipRefresh: true });
      }
    }

    let json: ApiSuccessResponse<T> | ApiErrorBody;
    try {
      json = (await res.json()) as ApiSuccessResponse<T> | ApiErrorBody;
    } catch {
      throw new ApiError({
        message: `Unexpected response (${res.status})`,
        statusCode: res.status,
        code: 'PARSE_ERROR',
      });
    }

    if (!res.ok || !json.success) {
      const err = !json.success ? json.error : undefined;
      const message = Array.isArray(err?.message)
        ? err.message.join(', ')
        : (err?.message ?? `Request failed (${res.status})`);
      throw new ApiError({
        message,
        statusCode: err?.statusCode ?? res.status,
        code: err?.code,
        details: err?.details,
      });
    }

    return json.data;
  }

  return {
    request,
    refreshTokens,
    get: <T>(path: string, auth = true) => request<T>(path, { method: 'GET', auth }),
    post: <T>(path: string, body?: unknown, auth = true) =>
      request<T>(path, { method: 'POST', body, auth }),
    patch: <T>(path: string, body?: unknown, auth = true) =>
      request<T>(path, { method: 'PATCH', body, auth }),
  };
}

export type HttpClient = ReturnType<typeof createHttpClient>;
