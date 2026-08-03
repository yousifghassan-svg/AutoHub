'use client';

import { useParams } from 'next/navigation';
import { SellWizard } from '@/features/sell';

/**
 * Edit Listing (P5-9) — same Sell Wizard as create, mode=edit.
 * No parallel form stack.
 */
export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  return <SellWizard mode="edit" listingId={id} />;
}
