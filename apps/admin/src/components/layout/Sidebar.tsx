'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/components/ui';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', shortcut: 'd' },
  { href: '/listings', label: 'Listings', shortcut: 'l' },
  { href: '/plates', label: 'Plates', shortcut: 'p' },
  { href: '/dealers', label: 'Dealers', shortcut: 'e' },
  { href: '/users', label: 'Users', shortcut: 'u' },
  { href: '/media', label: 'Media', shortcut: 'm' },
  { href: '/reports', label: 'Reports', shortcut: 'r' },
  { href: '/statistics', label: 'Statistics', shortcut: 's' },
  { href: '/settings', label: 'Settings', shortcut: 't' },
  { href: '/audit-logs', label: 'Audit Logs', shortcut: 'a' },
] as const;

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="Close sidebar"
          onClick={onClose}
        />
      ) : null}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-surface transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-14 items-center border-b border-border px-5">
          <Link href="/dashboard" className="font-display text-lg font-bold text-brand">
            AutoHub Admin
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition',
                      active
                        ? 'bg-brand-soft text-brand'
                        : 'text-ink-secondary hover:bg-surface-muted hover:text-ink',
                    )}
                  >
                    {item.label}
                    <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] text-ink-secondary lg:inline">
                      g {item.shortcut}
                    </kbd>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}

export { NAV_ITEMS };
