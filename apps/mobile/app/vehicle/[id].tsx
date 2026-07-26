import { useLocalSearchParams } from 'expo-router';
import { MarketDetailScreen } from '@/src/components/MarketDetailScreen';
import { useVehicleDetail } from '@/src/features/vehicles/hooks/useVehicles';

export default function VehicleDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const listingId = typeof id === 'string' ? id : '';
  const query = useVehicleDetail(listingId);
  return <MarketDetailScreen domain="VEHICLE" query={query} />;
}
