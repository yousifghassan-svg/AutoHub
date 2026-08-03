'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Badge, Button, EmptyState } from '@/components/ui';
import { LabShell } from '../_components/LabShell';
import { LAB_VEHICLES } from '../_components/lab-data';

const rows = [
  { ...LAB_VEHICLES[0]!, status: 'Active' as const, views: 128 },
  { ...LAB_VEHICLES[1]!, status: 'Draft' as const, views: 0 },
  { ...LAB_VEHICLES[2]!, status: 'Pending' as const, views: 12 },
];

export default function DesignLabMyListingsPage() {
  return (
    <LabShell title="My Listings Dashboard" subtitle="Quiet management · status at a glance">
      <div className="mx-auto max-w-4xl space-y-10 px-6 py-12 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight">Your listings</h2>
            <p className="mt-1 text-ink-secondary">Prototype dashboard — no API calls.</p>
          </div>
          <Button type="button">New listing</Button>
        </div>

        <ul className="space-y-3">
          {rows.map((row, i) => (
            <motion.li
              key={row.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-4 rounded-2xl bg-surface p-4 ring-1 ring-border sm:flex-row sm:items-center"
            >
              <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl sm:w-36">
                <Image src={row.image} alt="" fill unoptimized className="object-cover" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display font-semibold tracking-tight">{row.title}</p>
                  <Badge
                    tone={
                      row.status === 'Active'
                        ? 'success'
                        : row.status === 'Pending'
                          ? 'warning'
                          : 'neutral'
                    }
                  >
                    {row.status}
                  </Badge>
                </div>
                <p className="text-sm text-ink-secondary">
                  {row.price} {row.currency} · {row.views} views
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" size="sm">
                  Edit
                </Button>
                <Button type="button" variant="ghost" size="sm">
                  View
                </Button>
              </div>
            </motion.li>
          ))}
        </ul>

        <EmptyState
          title="Empty state sample"
          description="When you have no listings, keep the page airy — one sentence and one CTA."
          action={
            <Button type="button" size="sm">
              Create your first listing
            </Button>
          }
        />
      </div>
    </LabShell>
  );
}
