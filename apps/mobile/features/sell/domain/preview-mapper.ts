import type { ListingDetailModel } from '@/features/listing-detail/domain/types';
import type { WizardDraft } from './types';

/** Map wizard draft → ListingDetailModel for the Preview step (same UI as details). */
export function draftToPreviewDetail(draft: WizardDraft): ListingDetailModel {
  const year = draft.vehicleDetails.year ? Number(draft.vehicleDetails.year) : null;
  const mileage = draft.vehicleDetails.mileageKm
    ? Number(draft.vehicleDetails.mileageKm)
    : null;
  const price = draft.primaryPrice ? Number(draft.primaryPrice) : null;

  const specs = [
    ...(year != null && !Number.isNaN(year)
      ? [{ key: 'year', label: 'السنة', value: String(year) }]
      : []),
    ...(mileage != null && !Number.isNaN(mileage)
      ? [{ key: 'mileage', label: 'المسافة', value: `${mileage.toLocaleString()} km` }]
      : []),
    ...(draft.vehicleDetails.brandLabel
      ? [{ key: 'brand', label: 'الماركة', value: draft.vehicleDetails.brandLabel }]
      : []),
    ...(draft.vehicleDetails.modelLabel
      ? [{ key: 'model', label: 'الموديل', value: draft.vehicleDetails.modelLabel }]
      : []),
    ...(draft.vehicleTypeLabel
      ? [{ key: 'condition', label: 'الحالة', value: draft.vehicleTypeLabel }]
      : []),
    ...(draft.categoryLabel
      ? [{ key: 'category', label: 'الفئة', value: draft.categoryLabel }]
      : []),
  ];

  return {
    id: draft.listingId ?? draft.localId,
    slug: draft.localId,
    title: draft.title || 'Untitled listing',
    description: draft.description || 'No description yet.',
    price,
    currencyCode: draft.currencyCode,
    secondaryPrice: null,
    secondaryCurrencyCode: null,
    locationLabel: draft.cityLabel || '—',
    cityName: draft.cityLabel || '—',
    governorateName: null,
    categoryCode: draft.categoryCode ?? 'CAR',
    categoryName: draft.categoryLabel || draft.categoryCode || '—',
    isFeatured: false,
    isVerified: false,
    viewsCount: 0,
    favoritesCount: 0,
    publishedAt: null,
    media: draft.media.map((m, i) => ({
      id: m.localId,
      kind: m.kind,
      url: m.uri,
      thumbUrl: m.uri,
      r2Key: m.r2Key ?? m.uri,
      thumbnailKey: null,
      mimeType: m.mimeType,
      sortOrder: i,
    })),
    specs,
    seller: {
      id: 'me',
      displayName: 'You',
      phone: null,
      verified: false,
      bio: 'Draft preview',
    },
    similarQuery: { categoryCode: draft.categoryCode ?? undefined },
  };
}
