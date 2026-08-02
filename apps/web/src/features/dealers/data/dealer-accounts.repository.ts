import { getHttpClient } from '@/lib/api/client';

export type DealerMembershipRole = 'OWNER' | 'MANAGER' | 'STAFF';
export type DealerVerificationStatus =
  | 'UNVERIFIED'
  | 'PENDING'
  | 'VERIFIED'
  | 'REJECTED';

export type DealerMeResponse = {
  membershipRole: DealerMembershipRole;
  organization: {
    id: string;
    name: string;
    slug: string;
    verificationStatus: DealerVerificationStatus;
    verified: boolean;
    rejectionReason: string | null;
    bio: string | null;
    phone: string | null;
    whatsapp: string | null;
    address: string | null;
    openingHours: string | null;
    cityId: string | null;
    logoUrl: string | null;
    coverImageUrl: string | null;
    logoMediaId: string | null;
    coverMediaId: string | null;
    followersCount: number;
    viewsCount: number;
    memberCount?: number;
  };
};

export type DealerStats = {
  organizationId: string;
  activeListings: number;
  sold: number;
  followers: number;
  views: number;
  members: number;
  verificationStatus: DealerVerificationStatus;
  verified: boolean;
};

export type DealerMemberRow = {
  userId: string;
  role: DealerMembershipRole;
  displayName: string | null;
  phone: string | null;
  userRole: string;
  avatarUrl: string | null;
  joinedAt: string;
};

export const dealerAccountsRepository = {
  apply(input: {
    name: string;
    slug?: string;
    cityId?: string;
    phone?: string;
    whatsapp?: string;
    bio?: string;
    logoMediaId?: string;
    coverMediaId?: string;
  }) {
    return getHttpClient().post<DealerMeResponse>('/v1/dealers/applications', input, true);
  },

  getMe() {
    return getHttpClient().get<DealerMeResponse>('/v1/dealers/me', true);
  },

  updateMe(input: Record<string, unknown>) {
    return getHttpClient().patch<DealerMeResponse>('/v1/dealers/me', input, true);
  },

  reapply() {
    return getHttpClient().post<DealerMeResponse>('/v1/dealers/me/reapply', {}, true);
  },

  getStats() {
    return getHttpClient().get<DealerStats>('/v1/dealers/me/stats', true);
  },

  listMembers() {
    return getHttpClient().get<{ organizationId: string; items: DealerMemberRow[] }>(
      '/v1/dealers/me/members',
      true,
    );
  },

  addMember(input: { userId?: string; phone?: string; role?: DealerMembershipRole }) {
    return getHttpClient().post<DealerMemberRow>('/v1/dealers/me/members', input, true);
  },

  updateMember(userId: string, role: DealerMembershipRole) {
    return getHttpClient().patch<DealerMemberRow>(
      `/v1/dealers/me/members/${userId}`,
      { role },
      true,
    );
  },

  removeMember(userId: string) {
    return getHttpClient().delete<{ success: boolean }>(
      `/v1/dealers/me/members/${userId}`,
      true,
    );
  },
};
