import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { fetchPlateForSeo } from '@/lib/seo/fetch';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const listing = await fetchPlateForSeo(id);
  if (!listing) {
    return { title: 'Plate not found' };
  }

  const title =
    listing.translations?.[0]?.title ?? listing.title ?? listing.metaTitle ?? 'License plate';
  const description =
    listing.translations?.[0]?.description ??
    listing.description ??
    `Iraqi license plate for sale on AutoHub.`;

  return {
    title: `${title} · Plate`,
    description: description.slice(0, 160),
    openGraph: {
      title,
      description: description.slice(0, 160),
      type: 'website',
    },
  };
}

export default function PlateDetailLayout({ children }: { children: ReactNode }) {
  return children;
}
