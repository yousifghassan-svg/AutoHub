'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button, Input } from '@/components/ui';
import { LabShell } from '../_components/LabShell';
import { PremiumVehicleCard } from '../_components/PremiumVehicleCard';
import { LAB_VEHICLES } from '../_components/lab-data';

const SUGGESTIONS = [
  'Toyota Camry Baghdad',
  'Lexus RX Erbil',
  'Porsche 911',
  'Under 20M IQD',
  'Verified dealers',
];

export default function DesignLabSearchPage() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(true);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LAB_VEHICLES;
    return LAB_VEHICLES.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        (v.dealer?.toLowerCase().includes(q) ?? false),
    );
  }, [query]);

  return (
    <LabShell title="Search Experience" subtitle="Spotlight-inspired · calm focus">
      <div className="relative flex min-h-full flex-col items-center px-4 py-16 md:py-24">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-surface-muted)_0%,_transparent_55%)]"
          aria-hidden
        />

        <motion.div
          layout
          className="relative z-10 w-full max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="mb-6 text-center font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Find a vehicle
          </p>

          <div className="overflow-hidden rounded-2xl bg-surface shadow-2xl shadow-black/10 ring-1 ring-border">
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="text-ink-muted" aria-hidden>
                ⌕
              </span>
              <Input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                placeholder="Search make, model, city…"
                className="h-12 border-0 bg-transparent text-lg shadow-none focus-visible:ring-0"
                aria-label="Spotlight search prototype"
              />
              {query ? (
                <Button type="button" variant="ghost" size="sm" onClick={() => setQuery('')}>
                  Clear
                </Button>
              ) : null}
            </div>

            <AnimatePresence>
              {open ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="border-t border-border"
                >
                  <ul className="max-h-64 overflow-y-auto py-2" role="listbox">
                    {SUGGESTIONS.filter(
                      (s) => !query || s.toLowerCase().includes(query.toLowerCase()),
                    ).map((s) => (
                      <li key={s}>
                        <button
                          type="button"
                          className="flex w-full items-center gap-3 px-5 py-3 text-start text-sm text-ink transition hover:bg-surface-muted"
                          onClick={() => setQuery(s)}
                        >
                          <span className="text-ink-muted">↗</span>
                          {s}
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <p className="mt-4 text-center text-xs text-ink-muted">
            Prototype only — does not call production search APIs
          </p>
        </motion.div>

        <div className="relative z-10 mt-16 grid w-full max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => (
            <PremiumVehicleCard key={v.id} vehicle={v} />
          ))}
          {filtered.length === 0 ? (
            <p className="col-span-full text-center text-ink-secondary">No prototype matches.</p>
          ) : null}
        </div>
      </div>
    </LabShell>
  );
}
