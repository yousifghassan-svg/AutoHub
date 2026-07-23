import { QueryClient } from '@tanstack/react-query';

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (count, error) => {
          const offline =
            typeof error === 'object' &&
            error !== null &&
            'offline' in error &&
            (error as { offline?: boolean }).offline;
          if (offline) return false;
          return count < 2;
        },
        staleTime: 30_000,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
