import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { fetchDealerForSeo } from '@/lib/seo/fetch';
import { mediaPublicUrl } from '@/lib/media/url';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dealer = await fetchDealerForSeo(slug);
  if (!dealer) {
    return { title: 'Dealer not found' };
  }

  const description =
    dealer.bio?.slice(0, 160) ??
    `${dealer.name} — verified dealer inventory on AutoHub Iraq.`;

  const imageUrl =
    mediaPublicUrl(dealer.coverImageUrl) ??
    mediaPublicUrl(dealer.logoUrl) ??
    dealer.coverImageUrl ??
    dealer.logoUrl ??
    undefined;

  return {
    title: dealer.name,
    description,
    openGraph: {
      title: dealer.name,
      description,
      type: 'profile',
      ...(imageUrl ? { images: [{ url: imageUrl, alt: dealer.name }] } : {}),
    },
  };
}

export default function DealerProfileLayout({ children }: { children: ReactNode }) {
  return children;
}
