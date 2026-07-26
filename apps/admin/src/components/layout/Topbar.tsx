'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { useTheme } from '@/components/ThemeProvider';
import { Button, cn } from '@/components/ui';
import {
  Bell,
  ICON_SIZE_MD,
  ICON_STROKE,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
} from '@/components/icons';

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
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notifOpen && !profileOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [notifOpen, profileOpen]);

  const initial = (session?.user.displayName ?? session?.user.phone ?? 'A')
    .slice(0, 1)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur-md sm:gap-4 sm:px-6">
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-surface-muted hover:text-ink focus-visible:outline-none lg:hidden"
        aria-label="Open menu"
        onClick={onMenuClick}
      >
        <Menu size={ICON_SIZE_MD} strokeWidth={ICON_STROKE} aria-hidden />
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-medium uppercase tracking-[0.08em] text-ink-secondary">
          Admin
        </p>
        <h1 className="truncate font-display text-base font-semibold tracking-tight text-ink">
          {title}
        </h1>
      </div>

      {searchRef ? (
        <label className="relative hidden md:block">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-secondary">
            <Search size={16} strokeWidth={ICON_STROKE} aria-hidden />
          </span>
          <input
            ref={searchRef}
            type="search"
            placeholder="Search…"
            aria-label="Search"
            value={searchQuery ?? ''}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="h-9 w-48 rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-ink outline-none transition-all duration-200 placeholder:text-ink-secondary/70 focus:w-64 focus:border-brand/40 focus:ring-2 focus:ring-[var(--color-ring)] lg:w-56"
          />
        </label>
      ) : null}

      <div ref={menuRef} className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          onClick={toggleTheme}
        >
          {theme === 'dark' ? (
            <Sun size={ICON_SIZE_MD} strokeWidth={ICON_STROKE} aria-hidden />
          ) : (
            <Moon size={ICON_SIZE_MD} strokeWidth={ICON_STROKE} aria-hidden />
          )}
        </Button>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            aria-expanded={notifOpen}
            aria-haspopup="menu"
            onClick={() => {
              setNotifOpen((v) => !v);
              setProfileOpen(false);
            }}
          >
            <Bell size={ICON_SIZE_MD} strokeWidth={ICON_STROKE} aria-hidden />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
          </Button>
          {notifOpen ? (
            <div
              role="menu"
              aria-label="Notifications"
              className="absolute right-0 mt-2 w-80 animate-fade-in rounded-xl border border-border bg-surface p-2 shadow-lift"
            >
              <p className="px-2.5 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-secondary">
                Notifications
              </p>
              <ul className="divide-y divide-border">
                {NOTIFICATIONS.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      role="menuitem"
                      className="w-full rounded-lg px-2.5 py-2.5 text-left transition-colors hover:bg-surface-muted"
                      onClick={() => setNotifOpen(false)}
                    >
                      <p className="text-sm font-medium text-ink">{n.title}</p>
                      <p className="mt-0.5 text-xs text-ink-secondary">{n.time}</p>
                    </button>
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
              'flex items-center gap-2 rounded-lg px-1.5 py-1 text-sm transition-colors hover:bg-surface-muted',
              profileOpen && 'bg-surface-muted',
            )}
            aria-label="Account menu"
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            onClick={() => {
              setProfileOpen((v) => !v);
              setNotifOpen(false);
            }}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand ring-1 ring-brand/15">
              {initial}
            </span>
            <span className="hidden max-w-[140px] truncate text-left sm:inline">
              <span className="block truncate font-medium text-ink">
                {session?.user.displayName ?? session?.user.phone}
              </span>
              <span className="block truncate text-[11px] text-ink-secondary">
                {session?.user.role}
              </span>
            </span>
          </button>
          {profileOpen ? (
            <div
              role="menu"
              aria-label="Account"
              className="absolute right-0 mt-2 w-60 animate-fade-in rounded-xl border border-border bg-surface p-2 shadow-lift"
            >
              <div className="border-b border-border px-2.5 pb-2.5 pt-1">
                <p className="truncate text-sm font-semibold text-ink">
                  {session?.user.displayName ?? 'Staff user'}
                </p>
                <p className="truncate text-xs text-ink-secondary">{session?.user.role}</p>
                {session?.user.phone ? (
                  <p className="mt-0.5 truncate text-xs text-ink-secondary">{session.user.phone}</p>
                ) : null}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-1.5 w-full justify-start gap-2"
                role="menuitem"
                onClick={() => {
                  void logout().then(() => router.replace('/login'));
                }}
              >
                <LogOut size={16} strokeWidth={ICON_STROKE} aria-hidden />
                Log out
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
