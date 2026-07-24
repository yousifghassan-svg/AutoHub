'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { useFavoriteIds } from '@/features/favorites/favorites-store';
import { useTheme } from './ThemeProvider';
import { Button, cn } from './ui';

const nav = [
  { href: '/search', label: 'Search' },
  { href: '/dealers', label: 'Dealers' },
  { href: '/plates', label: 'Plates' },
  { href: '/sell', label: 'Sell' },
  { href: '/my-listings', label: 'My listings' },
  { href: '/favorites', label: 'Favorites' },
];

export function SiteHeader() {
  const { status, session, logout } = useAuth();
  const favorites = useFavoriteIds();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const favCount = mounted ? favorites.length : 0;
  const showAccount = mounted && (status === 'authenticated' || status === 'needs_profile');

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="page-container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="font-display text-xl font-bold tracking-tight text-ink">
          Auto<span className="text-brand">Hub</span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-ink-secondary hover:text-ink"
            >
              {item.label}
              {item.href === '/favorites' && favCount > 0 ? ` (${favCount})` : ''}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-md border border-border px-2.5 py-2 text-sm text-ink-secondary hover:bg-surface-muted"
          >
            {mounted && theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          {showAccount ? (
            <>
              <Link href="/profile" className="text-sm font-medium text-ink">
                {session?.user.displayName ?? session?.user.phone ?? 'Profile'}
              </Link>
              <Button variant="secondary" size="sm" onClick={() => void logout()}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="md:hidden"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="block h-0.5 w-6 bg-ink" />
          <span className="mt-1.5 block h-0.5 w-6 bg-ink" />
          <span className="mt-1.5 block h-0.5 w-6 bg-ink" />
        </button>
      </div>

      <div className={cn('border-t border-border md:hidden', !open && 'hidden')}>
        <div className="page-container flex flex-col gap-3 py-4">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <button type="button" onClick={toggleTheme} className="text-left text-sm">
            Toggle {mounted && theme === 'dark' ? 'light' : 'dark'} mode
          </button>
          {showAccount ? (
            <>
              <Link href="/profile" onClick={() => setOpen(false)}>
                Profile
              </Link>
              <Button variant="secondary" onClick={() => void logout()}>
                Log out
              </Button>
            </>
          ) : (
            <Link href="/login" onClick={() => setOpen(false)}>
              <Button className="w-full">Log in</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
