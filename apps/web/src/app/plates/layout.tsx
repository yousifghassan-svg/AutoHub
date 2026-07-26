import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'License plates marketplace',
  description: 'Browse and search Iraqi license plates with authentic SVG previews on AutoHub.',
};

export default function PlatesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
