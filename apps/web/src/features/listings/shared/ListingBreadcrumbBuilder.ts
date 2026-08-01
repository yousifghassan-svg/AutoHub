import type { BreadcrumbItem } from '@/components/Breadcrumbs';
import { CATEGORIES, type ListingDetailModel } from '../domain/types';
import { isPlateListing } from '../domain/marketplace-path';

/**
 * Builds marketplace detail breadcrumbs from listing fields.
 * Pages should not assemble crumb arrays inline.
 */
export class ListingBreadcrumbBuilder {
  static forListing(listing: ListingDetailModel): BreadcrumbItem[] {
    const items: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];

    if (isPlateListing(listing)) {
      items.push({ label: 'Plates', href: '/plates' });
      const location = listing.locationText ?? listing.location;
      if (location) {
        items.push({
          label: location,
          href: '/plates/search',
        });
      }
      items.push({ label: listing.title || 'Plate' });
      return items;
    }

    items.push({ label: 'Vehicles', href: '/vehicles' });
    const category = CATEGORIES.find((c) => c.code === listing.categoryCode);
    if (category && category.code !== 'PLATE') {
      items.push({
        label: category.label,
        href: `/vehicles/search?category=${category.code}`,
      });
    }
    const location = listing.locationText ?? listing.location;
    if (location) {
      items.push({
        label: location,
        href: listing.categoryCode
          ? `/vehicles/search?category=${listing.categoryCode}`
          : '/vehicles/search',
      });
    }
    items.push({ label: listing.title || 'Vehicle' });
    return items;
  }
}
