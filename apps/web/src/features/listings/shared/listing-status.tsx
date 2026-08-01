import { Badge } from '@/components/ui';
import type { ListingStatus } from '../domain/types';

export type ListingStatusMeta = {
  status: ListingStatus;
  label: string;
  description: string;
  tone: 'neutral' | 'brand' | 'success' | 'warning';
};

const STATUS_META: Record<ListingStatus, Omit<ListingStatusMeta, 'status'>> = {
  DRAFT: {
    label: 'Draft',
    description: 'Not submitted yet. Finish editing and publish when ready.',
    tone: 'neutral',
  },
  PENDING: {
    label: 'Pending',
    description: 'Waiting for review before it appears publicly.',
    tone: 'warning',
  },
  ACTIVE: {
    label: 'Active',
    description: 'Live on the marketplace and visible to buyers.',
    tone: 'success',
  },
  RESERVED: {
    label: 'Reserved',
    description: 'Held for a buyer; not fully sold yet.',
    tone: 'brand',
  },
  SOLD: {
    label: 'Sold',
    description: 'This listing has been marked as sold.',
    tone: 'neutral',
  },
  ARCHIVED: {
    label: 'Archived',
    description: 'Hidden from public browse. You can republish later.',
    tone: 'neutral',
  },
  REJECTED: {
    label: 'Rejected',
    description: 'Needs changes before it can be resubmitted.',
    tone: 'warning',
  },
};

export function getListingStatusMeta(
  status: string | null | undefined,
): ListingStatusMeta | null {
  if (!status || !(status in STATUS_META)) return null;
  const key = status as ListingStatus;
  return { status: key, ...STATUS_META[key] };
}

/** Badge + short status description for marketplace detail / owner surfaces. */
export function ListingStatusBadge({
  status,
  className,
}: {
  status: string | null | undefined;
  className?: string;
}) {
  const meta = getListingStatusMeta(status);
  if (!meta) return null;
  return (
    <div className={className}>
      <Badge tone={meta.tone}>{meta.label}</Badge>
      <p className="mt-1.5 text-sm text-ink-secondary">{meta.description}</p>
    </div>
  );
}
