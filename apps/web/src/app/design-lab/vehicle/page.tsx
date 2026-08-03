'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Badge, Button } from '@/components/ui';
import { LabShell } from '../_components/LabShell';
import { LAB_PHOTOS, LAB_VEHICLES } from '../_components/lab-data';

const v = LAB_VEHICLES[0]!;

export default function DesignLabVehiclePage() {
  return (
    <LabShell title="Vehicle Details Prototype" subtitle="Photography first · sparse chrome">
      <div className="pb-20">
        <section className="relative aspect-[16/9] min-h-[320px] w-full overflow-hidden bg-surface-muted md:aspect-[21/9]">
          <Image
            src={LAB_PHOTOS.hero}
            alt={v.title}
            fill
            priority
            unoptimized
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </section>

        <div className="mx-auto grid max-w-5xl gap-12 px-6 py-12 md:grid-cols-[1fr_320px] md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge tone="brand">Featured</Badge>
                <Badge tone="success">Verified seller</Badge>
              </div>
              <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                {v.title}
              </h2>
              <p className="text-lg text-ink-secondary">
                {v.year} · {v.mileage} · {v.city}
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-4 border-y border-border py-6 sm:grid-cols-4">
              {[
                ['Transmission', 'Automatic'],
                ['Fuel', 'Petrol'],
                ['Body', 'Sedan'],
                ['Color', 'Pearl white'],
              ].map(([k, val]) => (
                <div key={k}>
                  <dt className="text-xs font-medium uppercase tracking-wider text-ink-muted">
                    {k}
                  </dt>
                  <dd className="mt-1 font-medium text-ink">{val}</dd>
                </div>
              ))}
            </dl>

            <div className="space-y-3">
              <h3 className="font-display text-xl font-semibold">About this car</h3>
              <p className="leading-relaxed text-ink-secondary">
                Single-owner example copy for the prototype. Photography stays large; description
                stays readable and short. No cluttered feature grids.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[LAB_PHOTOS.sedan, LAB_PHOTOS.coupe, LAB_PHOTOS.night].map((src) => (
                <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  <Image src={src} alt="" fill unoptimized className="object-cover" />
                </div>
              ))}
            </div>
          </motion.div>

          <aside className="h-fit space-y-5 rounded-2xl bg-surface p-6 ring-1 ring-border md:sticky md:top-6">
            <p className="font-display text-3xl font-bold tracking-tight">
              {v.price}{' '}
              <span className="text-base font-medium text-ink-secondary">{v.currency}</span>
            </p>
            <p className="text-sm text-ink-secondary">{v.dealer}</p>
            <Button type="button" className="h-12 w-full">
              Contact seller
            </Button>
            <Button type="button" variant="secondary" className="h-12 w-full">
              Save
            </Button>
          </aside>
        </div>
      </div>
    </LabShell>
  );
}
