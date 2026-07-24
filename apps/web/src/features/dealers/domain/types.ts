export type DealerOpeningHours = Record<
  string,
  { open?: string; close?: string; closed?: boolean } | string
>;

export type DealerReviewsPlaceholder = {
  placeholder: boolean;
  message: string;
  averageRating: number | null;
  count: number;
  items: unknown[];
};

export type DealerStatistics = {
  listingCount?: number;
  activeListings?: number;
  sold?: number;
  views?: number;
  followers?: number;
};

export type DealerCity = {
  nameEn: string;
  nameAr: string;
  slug?: string;
  governorate?: { nameEn: string; nameAr: string } | null;
};

export type DealerCard = {
  id: string;
  name: string;
  slug: string;
  verified: boolean;
  bio: string | null;
  phone: string | null;
  whatsapp?: string | null;
  address?: string | null;
  coverImageUrl?: string | null;
  logoUrl?: string | null;
  openingHours?: DealerOpeningHours | null;
  listingCount?: number;
  followersCount?: number;
  viewsCount?: number;
  city?: DealerCity | null;
  statistics?: DealerStatistics;
};
