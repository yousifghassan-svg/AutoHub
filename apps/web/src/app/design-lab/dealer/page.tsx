'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Badge, Button } from '@/components/ui';
import { LabShell } from '../_components/LabShell';
import { PremiumVehicleCard } from '../_components/PremiumVehicleCard';
import { LAB_PHOTOS, LAB_VEHICLES } from '../_components/lab-data';

export default function DesignLabDealerPage() {
  return (
    <LabShell title="Dealer Profile" subtitle="Showroom presence · trusted, not loud">
      <div className="pb-16">
        <section className="relative h-56 overflow-hidden md:h-72">
          <Image
            src={LAB_PHOTOS.showroom}
            alt=""
            fill
            unoptimized
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </section>

        <div className="relative mx-auto max-w-5xl px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="-mt-16 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
          >
            <div className="flex items-end gap-4">
              <div className="relative h-24 w-24 overflow-hidden rounded-2xl bg-surface ring-4 ring-background">
                <Image src={LAB_PHOTOS.dealer} alt="" fill unoptimized className="object-cover" />
              </div>
              <div className="space-y-1 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-3xl font-bold tracking-tight">Al-Noor Motors</h2>
                  <Badge tone="brand">Verified</Badge>
                </div>
                <p className="text-ink-secondary">Baghdad · 48 active listings</p>
              </div>
            </div>
            <Button type="button" className="h-11 px-6">
              Contact dealer
            </Button>
          </motion.div>

          <p className="mt-10 max-w-2xl leading-relaxed text-ink-secondary">
            Premium dealer profile prototype. Inventory uses the same Premium Vehicle Card —
            photography remains the hero; brand block stays quiet and credible.
          </p>

          <h3 className="mt-14 font-display text-2xl font-semibold tracking-tight">Inventory</h3>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {LAB_VEHICLES.map((v) => (
              <PremiumVehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        </div>
      </div>
    </LabShell>
  );
}
