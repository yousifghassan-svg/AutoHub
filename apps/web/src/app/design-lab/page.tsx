'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { LabShell } from './_components/LabShell';
import { LAB_NAV } from './_components/lab-data';

const sections = LAB_NAV.filter((item) => item.href !== '/design-lab');

export default function DesignLabHomePage() {
  return (
    <LabShell
      title="Interactive Design Sandbox"
      subtitle="AX-2 · Visual playground only — not the application"
    >
      <div className="mx-auto max-w-4xl px-6 py-12 md:px-10 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">
            Experience · AX-2
          </p>
          <h2 className="max-w-xl font-display text-4xl font-bold tracking-tight text-ink md:text-5xl">
            Design laboratory
          </h2>
          <p className="max-w-lg text-lg leading-relaxed text-ink-secondary">
            Prototypes for homepage, cards, search, sell, details, listings, dealers, motion,
            dark theme, and the component gallery. Nothing here ships to production pages.
          </p>
        </motion.div>

        <ul className="mt-14 grid gap-3 sm:grid-cols-2">
          {sections.map((item, i) => (
            <motion.li
              key={item.href}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={item.href}
                className="flex items-center justify-between rounded-2xl bg-surface px-5 py-4 ring-1 ring-border transition hover:ring-brand/40"
              >
                <span className="font-display text-base font-semibold tracking-tight">
                  {item.label}
                </span>
                <span className="text-sm text-ink-muted" aria-hidden>
                  →
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </LabShell>
  );
}
