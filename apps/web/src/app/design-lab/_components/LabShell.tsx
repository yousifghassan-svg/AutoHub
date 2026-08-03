'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Button, cn } from '@/components/ui';
import { useTheme } from '@/components/ThemeProvider';
import { LAB_NAV } from './lab-data';

/**
 * Full-viewport sandbox chrome. Covers production SiteHeader/Footer without
 * modifying root layout — Design Lab must not alter production pages.
 */
export function LabShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="fixed inset-0 z-[100] flex bg-background text-ink">
      <aside className="hidden w-56 shrink-0 flex-col border-e border-border bg-surface md:flex">
        <div className="border-b border-border px-4 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand">
            Design Lab
          </p>
          <p className="mt-1 font-display text-lg font-bold tracking-tight">AutoHub AX-2</p>
          <p className="mt-1 text-xs text-ink-secondary">Sandbox · not production</p>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2" aria-label="Design lab">
          {LAB_NAV.map((item) => {
            const active =
              item.href === '/design-lab'
                ? pathname === '/design-lab'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'block rounded-md px-3 py-2 text-sm transition',
                  active
                    ? 'bg-brand-soft font-semibold text-brand'
                    : 'text-ink-secondary hover:bg-surface-muted hover:text-ink',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-2 border-t border-border p-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={toggleTheme}
          >
            Theme: {theme}
          </Button>
          <Link href="/" className="block">
            <Button type="button" variant="ghost" size="sm" className="w-full">
              Exit to site
            </Button>
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border bg-surface/80 px-4 py-3 backdrop-blur-md md:px-8">
          <div className="min-w-0 flex-1 overflow-x-auto md:hidden">
            <div className="flex gap-2">
              {LAB_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-ink"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden min-w-0 flex-1 md:block">
            {title ? (
              <h1 className="truncate font-display text-xl font-semibold tracking-tight">
                {title}
              </h1>
            ) : null}
            {subtitle ? (
              <p className="truncate text-sm text-ink-secondary">{subtitle}</p>
            ) : null}
          </div>
          <span className="hidden rounded-full bg-amber-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-200 sm:inline">
            Prototype
          </span>
        </header>

        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="min-h-0 flex-1 overflow-y-auto"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
