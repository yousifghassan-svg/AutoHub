'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/components/ui';
import {
  Award,
  BadgeCheck,
  BarChart3,
  Boxes,
  Building2,
  Car,
  ChevronDown,
  Flag,
  Hash,
  ICON_SIZE_MD,
  ICON_STROKE,
  ImageIcon,
  LayoutDashboard,
  MapPin,
  MessageSquareWarning,
  MessagesSquare,
  ScrollText,
  Settings,
  Sparkles,
  Tags,
  Type,
  Users,
  type LucideIcon,
} from '@/components/icons';

export type NavItem = {
  href: string;
  label: string;
  shortcut?: string;
  icon: LucideIcon;
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'platform',
    label: 'Platform',
    items: [{ href: '/dashboard', label: 'Dashboard', shortcut: 'd', icon: LayoutDashboard }],
  },
  {
    id: 'vehicles',
    label: 'Vehicles',
    items: [
      { href: '/vehicles', label: 'Vehicles', shortcut: 'v', icon: Car },
      { href: '/vehicles/categories', label: 'Categories', icon: Tags },
      { href: '/vehicles/brands', label: 'Brands', icon: Award },
      { href: '/vehicles/models', label: 'Models', icon: Boxes },
      { href: '/vehicles/features', label: 'Features', icon: Sparkles },
      { href: '/vehicles/reports', label: 'Vehicle reports', icon: Flag },
    ],
  },
  {
    id: 'plates',
    label: 'Plates',
    items: [
      { href: '/plates', label: 'Plates', shortcut: 'p', icon: Hash },
      { href: '/plates/categories', label: 'Plate categories', icon: Tags },
      { href: '/plates/provinces', label: 'Provinces', icon: MapPin },
      { href: '/plates/prefixes', label: 'Prefixes', icon: Type },
      { href: '/plates/verification', label: 'Verification', icon: BadgeCheck },
      { href: '/plates/reports', label: 'Plate reports', icon: Flag },
    ],
  },
  {
    id: 'admin',
    label: 'Administration',
    items: [
      { href: '/dealers', label: 'Dealers', shortcut: 'e', icon: Building2 },
      { href: '/users', label: 'Users', shortcut: 'u', icon: Users },
      { href: '/media', label: 'Media', shortcut: 'm', icon: ImageIcon },
      { href: '/reports', label: 'Reports', shortcut: 'r', icon: MessageSquareWarning },
      { href: '/communication', label: 'Communication', shortcut: 'c', icon: MessagesSquare },
      { href: '/statistics', label: 'Statistics', shortcut: 's', icon: BarChart3 },
      { href: '/settings', label: 'Settings', shortcut: 't', icon: Settings },
      { href: '/audit-logs', label: 'Audit Logs', shortcut: 'a', icon: ScrollText },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items);

function isActive(pathname: string, href: string) {
  if (href === '/vehicles') {
    return (
      pathname === href ||
      (pathname.startsWith('/vehicles/') &&
        !pathname.startsWith('/vehicles/categories') &&
        !pathname.startsWith('/vehicles/brands') &&
        !pathname.startsWith('/vehicles/models') &&
        !pathname.startsWith('/vehicles/features') &&
        !pathname.startsWith('/vehicles/reports'))
    );
  }
  if (href === '/plates') {
    return (
      pathname === href ||
      (pathname.startsWith('/plates/') &&
        !pathname.startsWith('/plates/categories') &&
        !pathname.startsWith('/plates/provinces') &&
        !pathname.startsWith('/plates/prefixes') &&
        !pathname.startsWith('/plates/verification') &&
        !pathname.startsWith('/plates/reports'))
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function groupHasActive(pathname: string, group: NavGroup) {
  return group.items.some((item) => isActive(pathname, item.href));
}

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setCollapsed((prev) => {
      const next = { ...prev };
      for (const group of NAV_GROUPS) {
        if (groupHasActive(pathname, group)) {
          next[group.id] = false;
        }
      }
      return next;
    });
  }, [pathname]);

  const toggleGroup = (id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity lg:hidden"
          aria-label="Close sidebar"
          onClick={onClose}
        />
      ) : null}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-border bg-sidebar transition-transform duration-300 ease-soft lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border px-5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-xs font-bold text-white shadow-card"
            aria-hidden
          >
            AH
          </span>
          <Link
            href="/dashboard"
            className="font-display text-[15px] font-semibold tracking-tight text-ink transition-colors hover:text-brand"
          >
            AutoHub Admin
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main">
          <ul className="space-y-5">
            {NAV_GROUPS.map((group) => {
              const isCollapsed = collapsed[group.id] === true;
              const panelId = `nav-group-${group.id}`;
              return (
                <li key={group.id}>
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    aria-expanded={!isCollapsed}
                    aria-controls={panelId}
                    className="mb-1.5 flex w-full items-center justify-between rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-secondary transition-colors hover:text-ink"
                  >
                    <span>{group.label}</span>
                    <ChevronDown
                      size={14}
                      strokeWidth={ICON_STROKE}
                      className={cn(
                        'text-ink-secondary transition-transform duration-200 ease-soft',
                        isCollapsed && '-rotate-90',
                      )}
                      aria-hidden
                    />
                  </button>
                  <ul
                    id={panelId}
                    className={cn(
                      'space-y-0.5 overflow-hidden transition-all duration-200 ease-soft',
                      isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[480px] opacity-100',
                    )}
                  >
                    {group.items.map((item) => {
                      const active = isActive(pathname, item.href);
                      const Icon = item.icon;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={onClose}
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                              'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all duration-150 ease-soft',
                              active
                                ? 'bg-brand-soft text-brand shadow-sm'
                                : 'text-ink-secondary hover:bg-surface-muted hover:text-ink',
                            )}
                          >
                            <span
                              className={cn(
                                'flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors',
                                active
                                  ? 'bg-brand/10 text-brand'
                                  : 'text-ink-secondary group-hover:text-ink',
                              )}
                            >
                              <Icon size={ICON_SIZE_MD} strokeWidth={ICON_STROKE} aria-hidden />
                            </span>
                            <span className="truncate">{item.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
