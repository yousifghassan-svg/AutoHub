'use client';

import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  RangeField,
  SectionHeader,
  Select,
  Skeleton,
  TextArea,
  TextLink,
} from '@/components/ui';
import { LabShell } from '../_components/LabShell';
import { PremiumVehicleCard } from '../_components/PremiumVehicleCard';
import { LAB_VEHICLES } from '../_components/lab-data';

function GallerySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 border-b border-border pb-12 last:border-0">
      <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

export default function DesignLabComponentsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [range, setRange] = useState<[number, number]>([5, 40]);

  return (
    <LabShell title="Component Gallery" subtitle="Every primitive · states · empty · loading">
      <div className="mx-auto max-w-4xl space-y-12 px-6 py-12 md:px-10">
        <GallerySection title="Buttons">
          <div className="flex flex-wrap gap-3">
            <Button type="button">Primary</Button>
            <Button type="button" variant="secondary">
              Secondary
            </Button>
            <Button type="button" variant="ghost">
              Ghost
            </Button>
            <Button type="button" variant="danger">
              Danger
            </Button>
            <Button type="button" size="sm">
              Small
            </Button>
            <Button type="button" size="lg">
              Large
            </Button>
            <Button type="button" disabled>
              Disabled
            </Button>
          </div>
        </GallerySection>

        <GallerySection title="Badges">
          <div className="flex flex-wrap gap-2">
            <Badge>Neutral</Badge>
            <Badge tone="brand">Brand</Badge>
            <Badge tone="success">Success</Badge>
            <Badge tone="warning">Warning</Badge>
          </div>
        </GallerySection>

        <GallerySection title="Inputs">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Text" placeholder="Placeholder" />
            <Input label="With hint" hint="Helper copy" placeholder="Value" />
            <Input label="Disabled" disabled defaultValue="Locked" />
            <Select label="Select" defaultValue="a">
              <option value="a">Option A</option>
              <option value="b">Option B</option>
            </Select>
            <TextArea label="Text area" placeholder="Notes…" className="sm:col-span-2" />
            <div className="sm:col-span-2">
              <RangeField
                label="Price range (millions IQD)"
                min={0}
                max={100}
                value={range}
                onChange={setRange}
                format={(n) => `${n}M`}
              />
            </div>
          </div>
        </GallerySection>

        <GallerySection title="Cards">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <p className="font-display font-semibold">Surface card</p>
              <p className="mt-1 text-sm text-ink-secondary">Production Card primitive.</p>
            </Card>
            <PremiumVehicleCard vehicle={LAB_VEHICLES[0]!} size="compact" />
          </div>
        </GallerySection>

        <GallerySection title="Section header">
          <SectionHeader
            title="Section title"
            subtitle="Optional supporting line"
            action={
              <Button type="button" size="sm" variant="secondary">
                Action
              </Button>
            }
          />
        </GallerySection>

        <GallerySection title="Dialog">
          <Button type="button" onClick={() => setModalOpen(true)}>
            Open modal
          </Button>
          {/* LabShell is z-100; production Modal is z-50 — elevated overlay for lab only */}
          {modalOpen ? (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <button
                type="button"
                aria-label="Close dialog"
                className="absolute inset-0 bg-black/50"
                onClick={() => setModalOpen(false)}
              />
              <div
                role="dialog"
                aria-modal
                className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-lift"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold text-ink">
                    Prototype dialog
                  </h3>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-md px-2 py-1 text-sm text-ink-secondary hover:bg-surface-muted"
                  >
                    Close
                  </button>
                </div>
                <p className="text-sm text-ink-secondary">
                  Mirrors the shared Modal primitive at lab z-index so it appears above the sandbox
                  chrome. Production Modal API unchanged.
                </p>
                <div className="mt-4 flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={() => setModalOpen(false)}>
                    Confirm
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </GallerySection>

        <GallerySection title="Loading / skeletons">
          <div className="space-y-3">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-4 w-[66%]" />
            <Skeleton className="h-4 w-1/2" />
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="aspect-[3/2] w-full" />
              <Skeleton className="aspect-[3/2] w-full" />
              <Skeleton className="aspect-[3/2] w-full" />
            </div>
          </div>
        </GallerySection>

        <GallerySection title="Empty state">
          <div className="rounded-2xl ring-1 ring-border">
            <EmptyState
              title="Nothing here yet"
              description="Empty states stay spacious — one message, one next step."
              action={
                <Button type="button" size="sm">
                  Get started
                </Button>
              }
            />
          </div>
        </GallerySection>

        <GallerySection title="Text link">
          <TextLink href="/design-lab">Back to Design Lab home</TextLink>
        </GallerySection>
      </div>
    </LabShell>
  );
}
