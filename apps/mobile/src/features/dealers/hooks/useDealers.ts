import { useQuery } from '@tanstack/react-query';
import { getDealersRepository } from '../di';

export function useFeaturedDealers(pageSize = 8) {
  return useQuery({
    queryKey: ['dealers', 'home', pageSize],
    queryFn: async () => {
      const page = await getDealersRepository().list(1, pageSize);
      return page.items;
    },
  });
}
