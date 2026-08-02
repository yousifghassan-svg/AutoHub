import type { ListingStatus, MarketplaceDomainCode } from '../domain/types';

export type ListingActionId =
  | 'edit'
  | 'pause'
  | 'activate'
  | 'republish'
  | 'delete'
  | 'mark_sold'
  | 'preview_as_visitor';

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
      kind: 'preview';
    };

export type ListingActionsContext = {
  isOwner: boolean;
  listingId: string;
  domain: MarketplaceDomainCode;
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
      const vehicleWizardHref = `/sell?listingId=${encodeURIComponent(ctx.listingId)}`;
      actions.push({
        id: 'edit',
        label: status === 'DRAFT' ? 'Continue' : 'Edit',
        variant: 'secondary',
        kind: 'navigate',
        href:
          ctx.domain === 'VEHICLE'
            ? vehicleWizardHref
            : `/my-listings/${ctx.listingId}/edit`,
      });
    }

    if (status === 'ACTIVE' || status === 'PENDING' || status === 'RESERVED') {
      actions.push({
        id: 'pause',
        label: 'Pause',
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
        label: 'Republish',
        variant: 'primary',
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
