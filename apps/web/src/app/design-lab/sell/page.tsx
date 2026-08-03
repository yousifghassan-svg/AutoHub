'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, Select, TextArea, cn } from '@/components/ui';
import { LabShell } from '../_components/LabShell';

const STEPS = ['Basics', 'Details', 'Photos', 'Review'] as const;

export default function DesignLabSellPage() {
  const [step, setStep] = useState(0);

  return (
    <LabShell title="Sell Wizard Prototype" subtitle="Calm multi-step · one job per screen">
      <div className="mx-auto max-w-2xl px-6 py-12 md:py-16">
        <ol className="mb-12 flex items-center gap-2" aria-label="Wizard steps">
          {STEPS.map((label, i) => (
            <li key={label} className="flex flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(i)}
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition',
                  i === step
                    ? 'bg-brand text-white'
                    : i < step
                      ? 'bg-brand-soft text-brand'
                      : 'bg-surface-muted text-ink-muted',
                )}
                aria-current={i === step ? 'step' : undefined}
              >
                {i + 1}
              </button>
              <span
                className={cn(
                  'hidden text-sm sm:inline',
                  i === step ? 'font-semibold text-ink' : 'text-ink-muted',
                )}
              >
                {label}
              </span>
              {i < STEPS.length - 1 ? (
                <div className="mx-1 h-px flex-1 bg-border" aria-hidden />
              ) : null}
            </li>
          ))}
        </ol>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight">
                {STEPS[step]}
              </h2>
              <p className="mt-2 text-ink-secondary">
                Prototype UI only — does not create listings or touch frozen sell flows.
              </p>
            </div>

            {step === 0 ? (
              <div className="space-y-4">
                <Input label="Make" placeholder="Toyota" />
                <Input label="Model" placeholder="Camry" />
                <Select label="Year" defaultValue="2021">
                  <option value="2021">2021</option>
                  <option value="2020">2020</option>
                  <option value="2019">2019</option>
                </Select>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="space-y-4">
                <Input label="Price (IQD)" placeholder="18,500,000" />
                <Input label="City" placeholder="Baghdad" />
                <TextArea label="Description" rows={4} placeholder="Condition, service history…" />
              </div>
            ) : null}

            {step === 2 ? (
              <div className="grid aspect-[16/10] place-items-center rounded-2xl border border-dashed border-border bg-surface-muted">
                <div className="space-y-2 text-center">
                  <p className="font-display text-lg font-semibold">Drop photos here</p>
                  <p className="text-sm text-ink-secondary">
                    Large, edge-to-edge imagery in production
                  </p>
                  <Button type="button" variant="secondary" size="sm">
                    Choose files
                  </Button>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-4 rounded-2xl bg-surface p-6 ring-1 ring-border">
                <p className="font-display text-xl font-semibold">2021 Toyota Camry SE</p>
                <p className="text-ink-secondary">18,500,000 IQD · Baghdad</p>
                <p className="text-sm text-ink-muted">
                  Review is calm: one column, no urgency badges, clear publish CTA.
                </p>
              </div>
            ) : null}

            <div className="flex justify-between gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                disabled={step === 0}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              >
                {step === STEPS.length - 1 ? 'Publish (prototype)' : 'Continue'}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </LabShell>
  );
}
