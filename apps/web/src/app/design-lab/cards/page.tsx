'use client';

import { LabShell } from '../_components/LabShell';
import { PremiumVehicleCard } from '../_components/PremiumVehicleCard';
import { LAB_VEHICLES } from '../_components/lab-data';

export default function DesignLabCardsPage() {
  return (
    <LabShell
      title="Vehicle Card Showcase"
      subtitle="Apple quality · Tesla simplicity · Rivian elegance"
    >
      <div className="space-y-16 px-6 py-12 md:px-12 md:py-16">
        <section className="space-y-6">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">Large</h2>
            <p className="mt-1 text-sm text-ink-secondary">
              Edge-to-edge photography, price on media, quiet metadata.
            </p>
          </div>
          <div className="max-w-2xl">
            <PremiumVehicleCard vehicle={LAB_VEHICLES[0]!} size="large" />
          </div>
        </section>

        <section className="space-y-6">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">Grid</h2>
            <p className="mt-1 text-sm text-ink-secondary">Default marketplace density.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {LAB_VEHICLES.map((v) => (
              <PremiumVehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">Compact</h2>
            <p className="mt-1 text-sm text-ink-secondary">Carousel / dense browse.</p>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {LAB_VEHICLES.map((v) => (
              <PremiumVehicleCard
                key={v.id}
                vehicle={v}
                size="compact"
                className="w-[260px] shrink-0"
              />
            ))}
          </div>
        </section>
      </div>
    </LabShell>
  );
}
