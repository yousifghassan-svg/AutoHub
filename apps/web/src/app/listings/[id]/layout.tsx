import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { fetchListingForSeo } from '@/lib/seo/fetch';
import { mediaPublicUrl } from '@/lib/media/url';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const listing = await fetchListingForSeo(id);
  if (!listing) {
    return { title: 'Listing not found' };
  }

  const title =
    listing.translations?.[0]?.title ?? listing.title ?? listing.metaTitle ?? 'Vehicle listing';
  const description =
    listing.translations?.[0]?.description ??
    listing.description ??
    listing.metaDescription ??
    `View this listing on AutoHub — Iraq vehicle marketplace.`;

  const imageKey = listing.thumbnailKey ?? listing.imageUrl;
  const imageUrl = mediaPublicUrl(imageKey) ?? listing.imageUrl ?? undefined;

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

export default function ListingDetailLayout({ children }: { children: ReactNode }) {
  return children;
}
