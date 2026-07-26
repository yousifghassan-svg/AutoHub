'use client';

import Link from 'next/link';
import { Card, PageHeader, TextLink } from '@/components/ui';

export default function VehicleFeaturesPage() {
  return (
    <div>
      <PageHeader
        title="Vehicle features"
        description="Equipment tags and optional features on vehicle listings."
      />

      <Card className="space-y-4 p-6">
        <p className="text-sm text-ink-secondary">
          Vehicle listings store optional equipment and feature tags on the{' '}
          <code className="rounded bg-surface-muted px-1 py-0.5 text-ink">Listing.features</code>{' '}
          field (JSON array of tag codes). Examples include sunroof, leather seats, navigation,
          parking sensors, and ADAS packages.
        </p>
        <p className="text-sm text-ink-secondary">
          A dedicated features catalog and editor will be added in a follow-up sprint. For now,
          features are edited inline on the{' '}
          <TextLink href="/vehicles">vehicle form</TextLink> when the API exposes them.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-ink-secondary">
          <li>Tag source: marketplace catalog (planned)</li>
          <li>Storage: Listing.features JSON on vehicle domain</li>
          <li>Search: filterable via catalog filters (future)</li>
        </ul>
        <Link href="/vehicles" className="text-sm font-semibold text-brand hover:underline">
          Back to vehicles
        </Link>
      </Card>
    </div>
  );
}
