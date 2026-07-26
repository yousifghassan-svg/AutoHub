import { useLocalSearchParams } from 'expo-router';
import { MarketDetailScreen } from '@/src/components/MarketDetailScreen';
import { usePlateDetail } from '@/src/features/plates/hooks/usePlates';

export default function PlateDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const listingId = typeof id === 'string' ? id : '';
  const query = usePlateDetail(listingId);
  return <MarketDetailScreen domain="PLATE" query={query} />;
}
