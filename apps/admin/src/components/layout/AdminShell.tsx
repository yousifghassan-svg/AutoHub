'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useSearch } from '@/components/SearchProvider';
import { useAuth } from '@/features/auth/AuthProvider';
import { hasAdminAccess } from '@/features/auth/domain/types';
import { NAV_ITEMS, Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Skeleton } from '@/components/ui';

function titleFromPath(pathname: string): string {
  const item = NAV_ITEMS.find(
    (n) => pathname === n.href || pathname.startsWith(`${n.href}/`),
  );
  if (item) return item.label;
  if (pathname.startsWith('/listings/')) return 'Listing detail';
  if (pathname.startsWith('/dealers/')) return 'Dealer detail';
  return 'Admin';
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { status, session, hasAccess } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { inputRef: searchRef, enabled: searchEnabled, query, setQuery } = useSearch();
  const gPending = useRef(false);

  useEffect(() => {
    if (status === 'bootstrapping') return;
    if (!session || !hasAdminAccess(session.user)) {
      router.replace('/login');
    }
  }, [status, session, router]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      if (e.key === '/' && !typing && searchRef.current) {
        e.preventDefault();
        searchRef.current.focus();
        return;
      }

      if (typing) return;

      if (e.key === 'g') {
        gPending.current = true;
        return;
      }

      if (gPending.current) {
        gPending.current = false;
        const map: Record<string, string> = {
          d: '/dashboard',
          l: '/listings',
          p: '/plates',
          e: '/dealers',
          u: '/users',
          m: '/media',
          r: '/reports',
          s: '/statistics',
          t: '/settings',
          a: '/audit-logs',
        };
        const href = map[e.key];
        if (href) {
          e.preventDefault();
          router.push(href);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [router, searchRef]);

  if (status === 'bootstrapping') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8">
        <div className="w-full max-w-sm space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (!session || !hasAccess) return null;

  const showSearch = searchEnabled;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={titleFromPath(pathname)}
          onMenuClick={() => setSidebarOpen(true)}
          searchRef={showSearch ? searchRef : undefined}
          searchQuery={query}
          onSearchChange={setQuery}
        />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
