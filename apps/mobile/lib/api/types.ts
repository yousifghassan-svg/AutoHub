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
  readonly offline: boolean;

  constructor(params: {
    message: string;
    statusCode: number;
    code?: string;
    details?: unknown;
    offline?: boolean;
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.statusCode = params.statusCode;
    this.code = params.code;
    this.details = params.details;
    this.offline = params.offline ?? false;
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

export type SellerType = 'INDIVIDUAL' | 'DEALER';

export type AuthenticatedSellerProfile = {
  type: SellerType;
  displayName: string;
  bio: string | null;
};

export type NotificationPreferences = {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  newMessage: boolean;
  listingApproved: boolean;
  listingRejected: boolean;
  priceChange: boolean;
  favouriteUpdate: boolean;
  dealerReply: boolean;
  system: boolean;
};

export type AuthenticatedUser = {
  id: string;
  firebaseUid: string | null;
  phone: string | null;
  email: string | null;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
  permissions: string[];
  status: string;
  preferredLanguage: 'ar' | 'ku' | 'en' | null;
  cityId: string | null;
  city: AuthenticatedUserCity | null;
  governorate: AuthenticatedUserGovernorate | null;
  avatarUrl: string | null;
  avatarMediaId: string | null;
  dateOfBirth: string | null;
  identityStatus: IdentityStatus;
  profileCompletionPercent: number;
  sellerProfile: AuthenticatedSellerProfile | null;
  notificationPreferences: NotificationPreferences;
};

export type UpdateProfileInput = {
  displayName?: string;
  firstName?: string | null;
  lastName?: string | null;
  cityId?: string;
  preferredLanguage?: 'ar' | 'ku' | 'en' | null;
  email?: string | null;
  avatarUrl?: string | null;
  avatarMediaId?: string | null;
  dateOfBirth?: string | null;
  sellerType?: SellerType;
  bio?: string | null;
  sellerDisplayName?: string | null;
  notificationPreferences?: Partial<NotificationPreferences>;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: AuthenticatedUser;
};

export type SellerProfile = {
  userId: string;
  type: SellerType;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  firstName: string | null;
  lastName: string | null;
  city: AuthenticatedUserCity | null;
  governorate: AuthenticatedUserGovernorate | null;
};
