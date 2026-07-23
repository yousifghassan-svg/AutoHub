export type ListingMediaKind = 'IMAGE' | 'VIDEO' | '360_MEDIA';

export type ListingMediaItem = {
  id: string;
  kind: ListingMediaKind;
  url: string | null;
  thumbUrl: string | null;
  r2Key: string;
  thumbnailKey: string | null;
  mimeType: string | null;
  sortOrder: number;
};

export type SpecRow = {
  key: string;
  label: string;
  value: string;
};

export type SellerCardModel = {
  id: string;
  displayName: string;
  /** E.164 when available (mock / future API); null → call/WhatsApp disabled */
  phone: string | null;
  verified: boolean;
  bio: string | null;
};

export type ListingDetailModel = {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number | null;
  currencyCode: string;
  secondaryPrice: number | null;
  secondaryCurrencyCode: string | null;
  locationLabel: string;
  cityName: string;
  governorateName: string | null;
  categoryCode: string;
  categoryName: string;
  isFeatured: boolean;
  isVerified: boolean;
  viewsCount: number;
  favoritesCount: number;
  publishedAt: string | null;
  media: ListingMediaItem[];
  specs: SpecRow[];
  seller: SellerCardModel;
  /** For similar listings query */
  similarQuery: {
    categoryCode?: string;
    cityId?: string;
    brandId?: string;
  };
};

export type SimilarListing = {
  id: string;
  title: string;
  price: number | null;
  currencyCode: string;
  location: string;
  imageUrl: string | null;
  year: number | null;
  isVerified: boolean;
  isFeatured: boolean;
};
