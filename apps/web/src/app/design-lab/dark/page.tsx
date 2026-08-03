'use client';

import { useLayoutEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui';
import { useTheme } from '@/components/ThemeProvider';
import { LabShell } from '../_components/LabShell';
import { PremiumVehicleCard } from '../_components/PremiumVehicleCard';
import { LAB_PHOTOS, LAB_VEHICLES } from '../_components/lab-data';

export default function DesignLabDarkPage() {
  const { setTheme } = useTheme();

  useLayoutEffect(() => {
    const root = document.documentElement;
    const prev = root.classList.contains('dark') ? 'dark' : 'light';
    setTheme('dark');
    return () => {
      setTheme(prev);
    };
  }, [setTheme]);

  return (
    <LabShell title="Dark Theme Showcase" subtitle="Graphite luxury · signal red accent">
      <div className="space-y-0">
        <section className="relative min-h-[420px] overflow-hidden">
          <Image
            src={LAB_PHOTOS.night}
            alt=""
            fill
            unoptimized
            className="object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E1116] via-[#0E1116]/50 to-transparent" />
          <div className="relative flex min-h-[420px] flex-col justify-end px-6 pb-12 md:px-16">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
              Dark · graphite
            </p>
            <h2 className="mt-3 max-w-lg font-display text-4xl font-bold tracking-tight text-white md:text-5xl">
              Luxury without neon
            </h2>
            <p className="mt-3 max-w-md text-white/70">
              Surfaces stay deep graphite. Photography carries drama. Brand signal stays red —
              never purple glow.
            </p>
          </div>
        </section>

        <section className="bg-[#0E1116] px-6 py-16 md:px-16">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-2xl font-semibold text-white">Cards on dark</h3>
              <p className="mt-1 text-sm text-white/55">Theme is pinned for this showcase route.</p>
            </div>
            <Button type="button" variant="secondary" onClick={() => setTheme('light')}>
              Preview light (global)
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {LAB_VEHICLES.map((v) => (
              <PremiumVehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        </section>

        <section className="space-y-4 bg-[#171B21] px-6 py-16 text-center md:px-16">
          <h3 className="font-display text-3xl font-semibold text-white">Sell band</h3>
          <p className="mx-auto max-w-md text-white/65">
            Full-bleed graphite band with one sentence and one signal CTA.
          </p>
          <Button type="button" className="h-12 px-10">
            List a vehicle
          </Button>
        </section>
      </div>
    </LabShell>
  );
}
