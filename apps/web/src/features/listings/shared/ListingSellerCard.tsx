'use client';

import Link from 'next/link';
import { Card } from '@/components/ui';
import { mediaPublicUrl } from '@/lib/media/url';
import type { SellerContactModel } from '../domain/types';

export function ListingSellerCard({
  sellerContact,
  isVerified,
}: {
  sellerContact: SellerContactModel | null;
  isVerified?: boolean;
}) {
  const contact = sellerContact;
  const dealerLogo = mediaPublicUrl(contact?.dealerLogoUrl);

  if (contact?.dealerSlug) {
    return (
      <Link href={`/dealers/${contact.dealerSlug}`}>
        <Card className="transition hover:border-brand/40">
          <div className="flex items-center gap-4">
            {dealerLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={dealerLogo}
                alt=""
                className="h-14 w-14 rounded-xl border border-border object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-soft text-lg font-bold text-brand">
                {(contact.dealerName ?? 'D').slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-ink">{contact.dealerName ?? 'Dealer'}</p>
                {contact.dealerVerified ? (
                  <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">
                    Verified
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-ink-secondary">View dealer profile</p>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Card>
      <p className="mb-2 text-sm font-semibold text-ink">Seller</p>
      <p className="text-sm text-ink-secondary">
        {contact?.displayName
          ? contact.displayName
          : isVerified
            ? 'Verified seller on AutoHub.'
            : 'Private seller listing.'}
      </p>
      {contact?.dealerVerified || isVerified ? (
        <p className="mt-2 text-xs font-semibold text-success">Verified</p>
      ) : null}
      <Link href="/dealers" className="mt-3 inline-block text-sm font-semibold text-brand">
        Browse dealers
      </Link>
    </Card>
  );
}
