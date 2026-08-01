import { getHttpClient } from '@/lib/api/client';
import type { SellerProfile, SellerType } from '@/lib/api/types';

export const sellersRepository = {
  getMine() {
    return getHttpClient().get<SellerProfile>('/v1/sellers/me', true);
  },

  updateMine(input: {
    type?: SellerType;
    displayName?: string;
    bio?: string | null;
  }) {
    return getHttpClient().patch<SellerProfile>('/v1/sellers/me', input, true);
  },

  getPublic(userId: string) {
    return getHttpClient().get<SellerProfile>(`/v1/sellers/${userId}`, false);
  },
};
