export type ApiMeta = {
  requestId: string;
  timestamp: string;
};

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  meta: ApiMeta;
};

export type ApiErrorBody = {
  success: false;
  error: {
    statusCode: number;
    message: string | string[];
    code?: string;
    details?: unknown;
  };
  meta: ApiMeta;
};

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(params: {
    message: string;
    statusCode: number;
    code?: string;
    details?: unknown;
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.statusCode = params.statusCode;
    this.code = params.code;
    this.details = params.details;
  }
}

export type AuthenticatedUser = {
  id: string;
  firebaseUid: string | null;
  phone: string | null;
  email: string | null;
  displayName: string | null;
  role: string;
  permissions: string[];
  status: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: AuthenticatedUser;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
