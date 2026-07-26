import { ListingRail } from '@/features/home/components/ListingRail';
import type { ListingCardModel } from '@/features/home/domain/types';
import type { MarketplaceCard } from '@/src/types/marketplace';

export function MarketplaceRail({
  title,
  items,
  loading,
  emptyTitle,
  onPressItem,
  onSeeAll,
}: {
  title: string;
  items: MarketplaceCard[];
  loading?: boolean;
  emptyTitle?: string;
  onPressItem: (item: MarketplaceCard) => void;
  onSeeAll?: () => void;
}) {
  return (
    <ListingRail
      title={title}
      listings={items as ListingCardModel[]}
      loading={loading}
      emptyTitle={emptyTitle}
      onPressListing={(listing) => onPressItem(listing as MarketplaceCard)}
      onSeeAll={onSeeAll}
    />
  );
}
