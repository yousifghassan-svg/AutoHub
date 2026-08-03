'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Button, cn } from '@/components/ui';
import { useSearchSuggestions } from '@/features/search/hooks/useMarketplaceSearch';
import { HOME_EASE } from '../lib/motion';

const HERO_SRC =
  'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=2000&q=80';

export function HomeHero() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const inputId = useId();
  const listId = useId();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const suggestions = useSearchSuggestions(q, open && q.trim().length >= 2);

  function goSearch(value?: string) {
    const term = (value ?? q).trim();
    const sp = new URLSearchParams();
    if (term) sp.set('q', term);
    router.push(`/vehicles/search${sp.toString() ? `?${sp}` : ''}`);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    goSearch();
  }

  const enter = reduceMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.28, ease: HOME_EASE },
      };

  return (
    <section
      aria-label="Welcome"
      className="relative isolate min-h-[min(78vh,720px)] overflow-hidden bg-[#171B21] md:min-h-[calc(100vh-4rem)]"
    >
      <Image
        src={HERO_SRC}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#0E1114]/80 via-[#0E1114]/35 to-[#0E1114]/15 dark:from-[#0E1114]/90 dark:via-[#0E1114]/45 dark:to-black/20"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-[min(78vh,720px)] max-w-5xl flex-col justify-end px-5 pb-14 pt-24 md:min-h-[calc(100vh-4rem)] md:justify-center md:px-8 md:pb-24 md:pt-20">
        <motion.div {...enter} className="mx-auto w-full max-w-xl space-y-5 text-center md:space-y-6">
          <p className="font-display text-5xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
            AutoHub
          </p>
          <p className="text-base text-white/85 md:text-lg">
            Iraq&apos;s premium marketplace for cars &amp; plates
          </p>

          <motion.form
            onSubmit={onSubmit}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { delay: 0.08, duration: 0.28, ease: HOME_EASE }
            }
            className="relative mx-auto w-full"
            role="search"
            aria-label="Search vehicles"
          >
            <div className="overflow-hidden rounded-2xl bg-white/10 shadow-2xl shadow-black/30 ring-1 ring-white/25 backdrop-blur-xl">
              <div className="flex items-center gap-2 px-3 py-2 sm:px-4">
                <span className="ps-1 text-lg text-white/55" aria-hidden>
                  ⌕
                </span>
                <label htmlFor={inputId} className="sr-only">
                  Search make, model, or city
                </label>
                <input
                  id={inputId}
                  type="search"
                  value={q}
                  autoComplete="off"
                  role="combobox"
                  aria-expanded={open && (suggestions.data?.length ?? 0) > 0}
                  aria-controls={listId}
                  aria-autocomplete="list"
                  placeholder="Search make, model, or city…"
                  onChange={(e) => {
                    setQ(e.target.value);
                    setOpen(true);
                  }}
                  onFocus={() => setOpen(true)}
                  onBlur={() => {
                    // Allow click on suggestion before close
                    window.setTimeout(() => setOpen(false), 120);
                  }}
                  className="h-12 w-full bg-transparent text-base text-white placeholder:text-white/55 outline-none md:h-14 md:text-lg"
                />
              </div>

              <AnimatePresence>
                {open && (suggestions.data?.length ?? 0) > 0 ? (
                  <motion.ul
                    id={listId}
                    role="listbox"
                    initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: HOME_EASE }}
                    className="max-h-56 overflow-y-auto border-t border-white/15 bg-[#171B21]/70 text-start"
                  >
                    {(suggestions.data ?? []).slice(0, 6).map((s) => (
                      <li key={`${s.type}-${s.id ?? s.label}`} role="option">
                        <button
                          type="button"
                          className="flex w-full items-center gap-3 px-5 py-3 text-sm text-white/90 transition hover:bg-white/10"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => goSearch(s.label)}
                        >
                          <span className="text-white/45" aria-hidden>
                            ↗
                          </span>
                          {s.label}
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                ) : null}
              </AnimatePresence>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-center">
              <Button type="submit" className="h-12 w-full px-10 sm:w-auto">
                Search
              </Button>
              <Link
                href="/sell"
                className={cn(
                  'inline-flex h-12 w-full items-center justify-center rounded-md border border-white/40 px-8 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto',
                )}
              >
                Sell
              </Link>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </section>
  );
}
