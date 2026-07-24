import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { IBM_Plex_Sans_Arabic, Outfit } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { SiteFooter } from '@/components/SiteFooter';
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'AutoHub — Iraq vehicle marketplace',
    template: '%s · AutoHub',
  },
  description:
    'Buy and sell cars, license plates, and vehicles across Iraq. Browse verified dealers, featured listings, and trusted local inventory.',
  openGraph: {
    type: 'website',
    locale: 'en_IQ',
    siteName: 'AutoHub',
    title: 'AutoHub — Iraq vehicle marketplace',
    description: 'Iraq’s professional marketplace for cars, plates, and dealers.',
    url: siteUrl,
    images: [
      {
        url: '/og.svg',
        width: 1200,
        height: 630,
        alt: 'AutoHub — Iraq vehicle marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AutoHub — Iraq vehicle marketplace',
    description: 'Buy and sell cars and plates across Iraq.',
    images: ['/og.svg'],
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${ibmArabic.variable}`} suppressHydrationWarning>
      <body>
        <Providers>
          <SiteHeader />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
