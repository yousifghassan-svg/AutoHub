import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search license plates',
  description: 'Filter Iraqi license plates by province, prefix, letter, number, and price.',
};

export default function PlateSearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
