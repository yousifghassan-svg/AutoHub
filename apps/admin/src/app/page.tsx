const links = [
  { href: 'http://localhost:4000/docs', label: 'API Swagger' },
  { href: 'http://localhost:4000/v1/health', label: 'API Health' },
  { href: 'http://localhost:3000', label: 'Web shell' },
] as const;

export default function AdminHomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-charcoal-900 px-6">
      <div className="max-w-xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-signal">
          Alpha — Admin deferred
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          AutoHub Admin
        </h1>
        <p className="mt-4 text-charcoal-300">
          Moderation and dealer tooling are not implemented in this Next.js app yet
          (Dealer Platform deferred). Listing lifecycle APIs exist on the Nest API;
          the consumer product UI runs in Expo mobile.
        </p>
        <ul className="mt-8 space-y-3 text-left text-sm text-charcoal-300">
          <li>
            <span className="text-white">API:</span> auth, listings, search, media,
            status transitions
          </li>
          <li>
            <span className="text-white">Mobile:</span> seller flows (create, my
            listings, mark sold / archive)
          </li>
        </ul>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md border border-charcoal-300/30 px-4 py-2 text-sm text-white transition hover:border-signal hover:text-signal"
              target="_blank"
              rel="noreferrer"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
