'use client';

import Link from 'next/link';
import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Card, Skeleton } from '@/components/ui';

function SearchRedirectInner() {
  const router = useRouter();
  const params = useSearchParams();
  const category = params.get('category') ?? '';

  useEffect(() => {
    const qs = params.toString();
    if (category === 'PLATE') {
      router.replace(qs ? `/plates/search?${qs}` : '/plates/search');
      return;
    }
    if (category && category !== 'PLATE') {
      router.replace(qs ? `/vehicles/search?${qs}` : '/vehicles/search');
    }
  }, [category, params, router]);

  if (category === 'PLATE' || (category && category !== 'PLATE')) {
    return (
      <div className="page-container py-16">
        <Skeleton className="mx-auto h-40 max-w-lg" />
      </div>
    );
  }

  return (
    <div className="page-container max-w-2xl py-16">
      <h1 className="section-title">Choose a marketplace</h1>
      <p className="mt-2 text-ink-secondary">
        Vehicles and plates have separate search engines. Pick one to continue.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card className="space-y-3 p-6">
          <h2 className="font-display text-lg font-semibold">Vehicles</h2>
          <p className="text-sm text-ink-secondary">
            Make, model, year, mileage, fuel, transmission, and body type.
          </p>
          <Link href="/vehicles/search">
            <Button className="w-full">Search vehicles</Button>
          </Link>
        </Card>
        <Card className="space-y-3 p-6">
          <h2 className="font-display text-lg font-semibold">Plates</h2>
          <p className="text-sm text-ink-secondary">
            Province, prefix, number, digits, and price.
          </p>
          <Link href="/plates/search">
            <Button className="w-full" variant="secondary">
              Search plates
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="page-container py-16">
          <Skeleton className="mx-auto h-40 max-w-lg" />
        </div>
      }
    >
      <SearchRedirectInner />
    </Suspense>
  );
}
