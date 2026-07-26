import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vehicles marketplace',
  description:
    'Browse cars, motorcycles, trucks, and commercial vehicles for sale across Iraq on AutoHub.',
  openGraph: {
    title: 'Vehicles marketplace · AutoHub',
    description:
      'Browse cars, motorcycles, trucks, and commercial vehicles for sale across Iraq.',
    type: 'website',
  },
};

export default function VehiclesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
