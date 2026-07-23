import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { IBM_Plex_Sans_Arabic, Outfit } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { SiteHeader } from '@/components/SiteHeader';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const ibmArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-arabic',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'AutoHub — Iraq vehicle marketplace',
    template: '%s · AutoHub',
  },
  description: 'Buy and sell cars, plates, and vehicles across Iraq.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${ibmArabic.variable}`}>
      <body>
        <Providers>
          <SiteHeader />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <footer className="mt-16 border-t border-border bg-surface">
            <div className="page-container flex flex-col gap-2 py-8 text-sm text-ink-secondary sm:flex-row sm:items-center sm:justify-between">
              <p className="font-display font-semibold text-ink">AutoHub</p>
              <p>Iraq vehicle marketplace · Alpha</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
