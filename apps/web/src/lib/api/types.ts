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

export type IdentityStatus =
  | 'unauthenticated'
  | 'needs_profile'
  | 'authenticated';

export type AuthenticatedUserCity = {
  id: string;
  nameEn: string;
  nameAr: string;
  nameKu: string | null;
  governorateId: string;
};

export type AuthenticatedUserGovernorate = {
  id: string;
  nameEn: string;
  nameAr: string;
  nameKu: string | null;
};

export type AuthenticatedUser = {
  id: string;
  firebaseUid: string | null;
  phone: string | null;
  email: string | null;
  displayName: string | null;
  role: string;
  permissions: string[];
  status: string;
  preferredLanguage: 'ar' | 'ku' | 'en' | null;
  cityId: string | null;
  city: AuthenticatedUserCity | null;
  governorate: AuthenticatedUserGovernorate | null;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  identityStatus: IdentityStatus;
};

export type UpdateProfileInput = {
  displayName?: string;
  cityId?: string;
  preferredLanguage?: 'ar' | 'ku' | 'en' | null;
  email?: string | null;
  avatarUrl?: string | null;
  dateOfBirth?: string | null;
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
