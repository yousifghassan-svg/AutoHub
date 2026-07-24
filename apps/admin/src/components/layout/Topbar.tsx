'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { useTheme } from '@/components/ThemeProvider';
import { Button, cn } from '@/components/ui';

const NOTIFICATIONS = [
  { id: '1', title: '3 listings pending review', time: '5m ago' },
  { id: '2', title: 'New report submitted', time: '1h ago' },
  { id: '3', title: 'Weekly stats ready', time: 'Today' },
];

export function Topbar({
  title,
  onMenuClick,
  searchRef,
  searchQuery,
  onSearchChange,
}: {
  title: string;
  onMenuClick: () => void;
  searchRef?: React.Ref<HTMLInputElement>;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
}) {
  const { session, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-surface/95 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        className="rounded-md p-2 text-ink-secondary hover:bg-surface-muted lg:hidden"
        aria-label="Open menu"
        onClick={onMenuClick}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-ink-secondary">Admin</p>
        <h1 className="truncate font-display text-base font-semibold text-ink">{title}</h1>
      </div>

      {searchRef ? (
        <input
          ref={searchRef}
          type="search"
          placeholder="Search… (press /)"
          aria-label="Search"
          value={searchQuery ?? ''}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="hidden h-9 w-48 rounded-md border border-border bg-background px-3 text-sm outline-none ring-brand focus:w-64 focus:ring-2 md:block lg:w-56"
        />
      ) : null}

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          onClick={toggleTheme}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </Button>

        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            aria-label="Notifications"
            aria-expanded={notifOpen}
            onClick={() => {
              setNotifOpen((v) => !v);
              setProfileOpen(false);
            }}
          >
            🔔
          </Button>
          {notifOpen ? (
            <div className="absolute right-0 mt-2 w-72 rounded-lg border border-border bg-surface p-2 shadow-lift">
              <p className="px-2 py-1 text-xs font-semibold uppercase text-ink-secondary">
                Notifications
              </p>
              <ul className="divide-y divide-border">
                {NOTIFICATIONS.map((n) => (
                  <li key={n.id} className="px-2 py-2 text-sm">
                    <p className="text-ink">{n.title}</p>
                    <p className="text-xs text-ink-secondary">{n.time}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="relative">
          <button
            type="button"
            className={cn(
              'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface-muted',
            )}
            aria-expanded={profileOpen}
            onClick={() => {
              setProfileOpen((v) => !v);
              setNotifOpen(false);
            }}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand">
              {(session?.user.displayName ?? session?.user.phone ?? 'A').slice(0, 1).toUpperCase()}
            </span>
            <span className="hidden max-w-[120px] truncate text-ink sm:inline">
              {session?.user.displayName ?? session?.user.phone}
            </span>
          </button>
          {profileOpen ? (
            <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-surface p-2 shadow-lift">
              <div className="border-b border-border px-2 pb-2">
                <p className="truncate font-medium text-ink">
                  {session?.user.displayName ?? 'Staff user'}
                </p>
                <p className="truncate text-xs text-ink-secondary">{session?.user.role}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full justify-start"
                onClick={() => {
                  void logout().then(() => router.replace('/login'));
                }}
              >
                Log out
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
