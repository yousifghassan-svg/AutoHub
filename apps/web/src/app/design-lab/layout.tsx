import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Design Lab · AutoHub',
  description: 'Isolated interactive design sandbox. Not production.',
  robots: { index: false, follow: false },
};

/**
 * Design Lab routes are fully isolated under /design-lab.
 * Root layout still mounts SiteHeader/Footer; LabShell covers them with a
 * fixed full-viewport layer so production chrome is never modified.
 */
export default function DesignLabLayout({ children }: { children: ReactNode }) {
  return children;
}
