export type ManageStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'ACTIVE'
  | 'REJECTED'
  | 'SOLD'
  | 'EXPIRED'
  | 'ARCHIVED'
  | 'RESERVED';

/** Sprint 22 tabs — Published maps to ACTIVE; Expired is client-filtered via expiresAt. */
export type ManageStatusTab =
  | 'ALL'
  | 'DRAFT'
  | 'PENDING'
  | 'ACTIVE'
  | 'REJECTED'
  | 'SOLD'
  | 'EXPIRED'
  | 'ARCHIVED';

export const MANAGE_STATUS_TABS: Array<{ key: ManageStatusTab; label: string }> = [
  { key: 'ALL', label: 'All' },
  { key: 'DRAFT', label: 'Draft' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'ACTIVE', label: 'Published' },
  { key: 'REJECTED', label: 'Rejected' },
  { key: 'SOLD', label: 'Sold' },
  { key: 'EXPIRED', label: 'Expired' },
  { key: 'ARCHIVED', label: 'Archived' },
];

export type ManagedItem = {
  id: string;
  slug: string;
  title: string;
  status: ManageStatus;
  price: number | null;
  currencyCode: string;
  location: string;
  imageUrl: string | null;
  categoryId: string;
  cityId: string;
  primaryCurrencyId: string | null;
  description: string;
  expiresAt: string | null;
  publishedAt: string | null;
  updatedAt: string;
  domain: 'VEHICLE' | 'PLATE';
};

export type ManagedPage = {
  items: ManagedItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ManageActionKey =
  | 'edit'
  | 'delete'
  | 'republish'
  | 'pause'
  | 'activate'
  | 'share'
  | 'duplicate'
  | 'view'
  | 'markSold';
