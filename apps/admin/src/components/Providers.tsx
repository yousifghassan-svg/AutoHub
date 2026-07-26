'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, useState, type ReactNode } from 'react';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { DialogProvider, Skeleton, ToastProvider } from '@/components/ui';
import { SearchProvider } from '@/components/SearchProvider';
import { ThemeProvider } from '@/components/ThemeProvider';

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <DialogProvider>
              <Suspense fallback={<Skeleton className="h-8 w-full" />}>
                <SearchProvider>{children}</SearchProvider>
              </Suspense>
            </DialogProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
