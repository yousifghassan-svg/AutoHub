import { marketplaceDetailPath } from '../domain/marketplace-path';
import type { ListingStatus, MarketplaceDomainCode } from '../domain/types';

export type ListingActionId =
  | 'edit'
  | 'pause'
  | 'activate'
  | 'republish'
  | 'delete'
  | 'mark_sold'
  | 'preview_as_visitor'
  | 'duplicate';

export type ListingActionVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export type ListingAction =
  | {
      id: 'edit';
      label: string;
      variant: ListingActionVariant;
      kind: 'navigate';
      href: string;
    }
  | {
      id: 'pause' | 'activate' | 'mark_sold';
      label: string;
      variant: ListingActionVariant;
      kind: 'status';
      nextStatus: ListingStatus;
    }
  | {
      id: 'republish';
      label: string;
      variant: ListingActionVariant;
      kind: 'status_sequence';
      /** Current status used to choose DRAFT→PENDING path. */
      fromStatus: ListingStatus;
    }
  | {
      id: 'delete';
      label: string;
      variant: ListingActionVariant;
      kind: 'delete';
    }
  | {
      id: 'preview_as_visitor';
      label: string;
      variant: ListingActionVariant;
      kind: 'preview' | 'navigate';
      href?: string;
    }
  | {
      id: 'duplicate';
      label: string;
      variant: ListingActionVariant;
      /** Future-ready — no API yet; UI shows a calm notice. */
      kind: 'coming_soon';
    };

export type ListingActionsContext = {
  isOwner: boolean;
  listingId: string;
  domain: MarketplaceDomainCode;
  categoryCode?: string | null;
  /** detail = listing page; manage = My Listings grid */
  surface: 'detail' | 'manage';
};

function asStatus(status: string | null | undefined): ListingStatus | null {
  if (!status) return null;
  const allowed: ListingStatus[] = [
    'DRAFT',
    'PENDING',
    'ACTIVE',
    'RESERVED',
    'SOLD',
    'ARCHIVED',
    'REJECTED',
  ];
  return allowed.includes(status as ListingStatus) ? (status as ListingStatus) : null;
}

/**
 * Action Registry — pages render whatever `getActions` returns.
 * Add future actions (Boost, Renew, Promote, Auction, …) here without page changes.
 */
export const ListingActions = {
  getActions(
    statusInput: string | null | undefined,
    ctx: ListingActionsContext,
  ): ListingAction[] {
    if (!ctx.isOwner) return [];
    const status = asStatus(statusInput);
    if (!status) return [];

    const actions: ListingAction[] = [];

    if (status !== 'SOLD' && status !== 'ARCHIVED') {
      actions.push({
        id: 'edit',
        label: status === 'DRAFT' ? 'Continue draft' : 'Edit',
        variant: status === 'DRAFT' ? 'primary' : 'secondary',
        kind: 'navigate',
        href: `/my-listings/${ctx.listingId}/edit`,
      });
    }

    if (ctx.surface === 'manage') {
      actions.push({
        id: 'preview_as_visitor',
        label: 'Preview',
        variant: 'secondary',
        kind: 'navigate',
        href: marketplaceDetailPath({
          id: ctx.listingId,
          domain: ctx.domain,
          categoryCode: ctx.categoryCode,
        }),
      });
    }

    if (status === 'ACTIVE' || status === 'PENDING' || status === 'RESERVED') {
      actions.push({
        id: 'pause',
        label: 'Archive',
        variant: 'ghost',
        kind: 'status',
        nextStatus: 'ARCHIVED',
      });
    }

    if (status === 'RESERVED') {
      actions.push({
        id: 'activate',
        label: 'Activate',
        variant: 'secondary',
        kind: 'status',
        nextStatus: 'ACTIVE',
      });
    }

    if (status === 'DRAFT' || status === 'REJECTED' || status === 'ARCHIVED') {
      actions.push({
        id: 'republish',
        label: status === 'DRAFT' ? 'Send for review' : 'Republish',
        variant: status === 'DRAFT' ? 'secondary' : 'primary',
        kind: 'status_sequence',
        fromStatus: status,
      });
    }

    if (status === 'ACTIVE' || status === 'RESERVED') {
      actions.push({
        id: 'mark_sold',
        label: 'Mark sold',
        variant: 'secondary',
        kind: 'status',
        nextStatus: 'SOLD',
      });
    }

    // Future-ready placeholder — architecture has no duplicate endpoint yet.
    if (ctx.surface === 'manage') {
      actions.push({
        id: 'duplicate',
        label: 'Duplicate',
        variant: 'ghost',
        kind: 'coming_soon',
      });
    }

    actions.push({
      id: 'delete',
      label: 'Delete',
      variant: 'ghost',
      kind: 'delete',
    });

    if (ctx.surface === 'detail') {
      actions.push({
        id: 'preview_as_visitor',
        label: 'Preview as visitor',
        variant: 'secondary',
        kind: 'preview',
      });
    }

    return actions;
  },
};
