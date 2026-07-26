import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { fetchVehicleForSeo } from '@/lib/seo/fetch';
import { mediaPublicUrl } from '@/lib/media/url';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const vehicle = await fetchVehicleForSeo(id);
  if (!vehicle) {
    return { title: 'Vehicle not found' };
  }

  const title =
    vehicle.translations?.[0]?.title ?? vehicle.title ?? vehicle.metaTitle ?? 'Vehicle listing';
  const description =
    vehicle.translations?.[0]?.description ??
    vehicle.description ??
    vehicle.metaDescription ??
    `View this vehicle on AutoHub — Iraq vehicle marketplace.`;

  const imageKey = vehicle.thumbnailKey ?? vehicle.imageUrl;
  const imageUrl = mediaPublicUrl(imageKey) ?? vehicle.imageUrl ?? undefined;

  return {
    title,
    description: description.slice(0, 160),
    openGraph: {
      title,
      description: description.slice(0, 160),
      type: 'website',
      ...(imageUrl ? { images: [{ url: imageUrl, alt: title }] } : {}),
    },
  };
}

export default function VehicleDetailLayout({ children }: { children: ReactNode }) {
  return children;
}
