import Link from 'next/link';

const columns = [
  {
    title: 'Browse',
    links: [
      { href: '/vehicles', label: 'Vehicles' },
      { href: '/vehicles/search', label: 'Search vehicles' },
      { href: '/plates', label: 'License plates' },
      { href: '/plates/search', label: 'Search plates' },
      { href: '/dealers', label: 'Dealers' },
      { href: '/favorites', label: 'Favorites' },
    ],
  },
  {
    title: 'Sell',
    links: [
      { href: '/sell', label: 'Start selling' },
      { href: '/vehicles/search?featured=1', label: 'Featured vehicles' },
      { href: '/my-listings', label: 'My listings' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/search', label: 'Search' },
      { href: '/login', label: 'Sign in' },
      { href: '/register', label: 'Create account' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-charcoal-900 text-white">
      <div className="page-container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <p className="font-display text-2xl font-bold tracking-tight">
            Auto<span className="text-brand">Hub</span>
          </p>
          <p className="max-w-xs text-sm text-white/70">
            Iraq’s professional marketplace for cars, plates, and trusted dealers.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">
              {col.title}
            </p>
            <ul className="space-y-2 text-sm">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/80 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="page-container flex flex-col gap-2 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} AutoHub. All rights reserved.</p>
          <p>Built for buyers and dealers across Iraq.</p>
        </div>
      </div>
    </footer>
  );
}
