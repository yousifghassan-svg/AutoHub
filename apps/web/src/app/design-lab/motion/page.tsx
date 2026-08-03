'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card } from '@/components/ui';
import { LabShell } from '../_components/LabShell';
import { PremiumVehicleCard } from '../_components/PremiumVehicleCard';
import { LAB_VEHICLES } from '../_components/lab-data';

const ease = [0.16, 1, 0.3, 1] as const;

export default function DesignLabMotionPage() {
  const [pulse, setPulse] = useState(0);
  const [show, setShow] = useState(true);

  return (
    <LabShell title="Motion Playground" subtitle="Framer Motion · expensive, never excessive">
      <div className="mx-auto max-w-4xl space-y-16 px-6 py-12 md:px-10">
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">Page enter</h2>
          <p className="text-sm text-ink-secondary">
            280ms fade + 8px rise · cubic-bezier(0.16, 1, 0.3, 1)
          </p>
          <Button type="button" variant="secondary" onClick={() => setPulse((n) => n + 1)}>
            Replay enter
          </Button>
          <motion.div
            key={pulse}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease }}
          >
            <Card className="p-6">
              <p className="font-display text-lg font-semibold">Calm entrance</p>
              <p className="mt-1 text-sm text-ink-secondary">No bounce. No spring chaos.</p>
            </Card>
          </motion.div>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">Stagger list</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {LAB_VEHICLES.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.4, ease }}
              >
                <PremiumVehicleCard vehicle={v} size="compact" />
              </motion.div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">Hover lift</h2>
          <p className="text-sm text-ink-secondary">−4px translate · 350ms · image scale 1.03</p>
          <div className="max-w-sm">
            <PremiumVehicleCard vehicle={LAB_VEHICLES[2]!} />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl font-semibold">Presence</h2>
            <Button type="button" size="sm" variant="secondary" onClick={() => setShow((s) => !s)}>
              Toggle
            </Button>
          </div>
          <AnimatePresence mode="wait">
            {show ? (
              <motion.div
                key="on"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.22, ease }}
                className="rounded-2xl bg-brand-soft px-6 py-8 text-center"
              >
                <p className="font-display text-xl font-semibold text-brand">Signal moment</p>
              </motion.div>
            ) : (
              <motion.p
                key="off"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-8 text-center text-ink-muted"
              >
                Hidden
              </motion.p>
            )}
          </AnimatePresence>
        </section>
      </div>
    </LabShell>
  );
}
