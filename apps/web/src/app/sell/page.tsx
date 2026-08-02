'use client';

import { Suspense } from 'react';
import { Skeleton } from '@/components/ui';
import { SellWizard } from '@/features/sell';

export default function SellWizardPage() {
  return (
    <Suspense
      fallback={
        <div className="page-container max-w-2xl space-y-4 py-10">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      }
    >
      <SellWizard />
    </Suspense>
  );
}
