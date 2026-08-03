'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button, Input } from '@/components/ui';
import { LabShell } from '../_components/LabShell';
import { PremiumVehicleCard } from '../_components/PremiumVehicleCard';
import { LAB_PHOTOS, LAB_VEHICLES } from '../_components/lab-data';

export default function DesignLabHomepagePage() {
  return (
    <LabShell title="Homepage Prototype" subtitle="Full-bleed hero · brand first · cars as hero">
      {/* Hero — edge-to-edge within lab canvas */}
      <section className="relative min-h-[min(100%,720px)] overflow-hidden">
        <Image
          src={LAB_PHOTOS.hero}
          alt=""
          fill
          priority
          unoptimized
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />
        <div className="relative flex min-h-[640px] flex-col justify-end px-6 pb-16 pt-24 md:px-16 md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-lg space-y-5"
          >
            <h2 className="font-display text-5xl font-bold tracking-tight text-white md:text-6xl">
              AutoHub
            </h2>
            <p className="text-lg text-white/85">
              Iraq&apos;s premium marketplace for cars &amp; plates
            </p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-3"
            >
              <Input
                type="search"
                placeholder="Search make, model, or city…"
                className="h-14 border-white/20 bg-white/10 text-white placeholder:text-white/55 backdrop-blur-md"
                aria-label="Prototype search"
              />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button type="button" className="h-12 px-8">
                  Search
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-12 border border-white/40 text-white hover:bg-white/10"
                >
                  Sell
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-16 md:py-24">
        <div className="mb-10 max-w-xl">
          <h3 className="font-display text-3xl font-semibold tracking-tight">Featured</h3>
          <p className="mt-2 text-ink-secondary">Selected for presence, not volume.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {LAB_VEHICLES.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <PremiumVehicleCard vehicle={v} />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 px-6 pb-16 md:grid-cols-2 md:px-16">
        {[
          { label: 'Vehicles', img: LAB_PHOTOS.sedan },
          { label: 'Plates', img: LAB_PHOTOS.showroom },
        ].map((tile) => (
          <div key={tile.label} className="relative aspect-[16/9] overflow-hidden rounded-2xl">
            <Image src={tile.img} alt="" fill unoptimized className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <p className="absolute bottom-5 start-5 font-display text-2xl font-semibold text-white">
              {tile.label}
            </p>
          </div>
        ))}
      </section>

      <section className="bg-[#171B21] px-6 py-16 text-white md:px-16 md:py-20">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <h3 className="font-display text-3xl font-semibold tracking-tight">
            List your vehicle
          </h3>
          <p className="text-white/70">A calm path from draft to showroom-ready listing.</p>
          <Button type="button" className="h-12 px-10">
            Start selling
          </Button>
        </div>
      </section>
    </LabShell>
  );
}
