import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search vehicles',
  description: 'Filter cars, motorcycles, trucks, and commercial vehicles by brand, year, mileage, and more.',
};

export default function VehicleSearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
