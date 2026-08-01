'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui';
import { useDomainMutations } from '../hooks/useDomainMutations';
import type { ListingStatus, MarketplaceDomainCode } from '../domain/types';
import {
  ListingActions,
  type ListingAction,
  type ListingActionsContext,
} from './listing-actions';

export function ListingOwnerActions({
  listingId,
  status,
  domain,
  surface,
  onPreview,
  className,
}: {
  listingId: string;
  status: string | null | undefined;
  domain: MarketplaceDomainCode;
  surface: ListingActionsContext['surface'];
  onPreview?: () => void;
  className?: string;
}) {
  const { changeStatus, softDelete } = useDomainMutations();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const actions = ListingActions.getActions(status, {
    isOwner: true,
    listingId,
    domain,
    surface,
  });

  const run = async (action: ListingAction) => {
    setError(null);
    if (action.kind === 'preview') {
      onPreview?.();
      return;
    }
    if (action.kind === 'navigate') return;

    setBusyId(action.id);
    try {
      if (action.kind === 'status') {
        await changeStatus.mutateAsync({
          id: listingId,
          status: action.nextStatus,
          domain,
        });
      } else if (action.kind === 'status_sequence') {
        if (action.fromStatus === 'ARCHIVED') {
          await changeStatus.mutateAsync({ id: listingId, status: 'DRAFT', domain });
        }
        if (
          action.fromStatus === 'ARCHIVED' ||
          action.fromStatus === 'DRAFT' ||
          action.fromStatus === 'REJECTED'
        ) {
          await changeStatus.mutateAsync({
            id: listingId,
            status: 'PENDING' satisfies ListingStatus,
            domain,
          });
        }
      } else if (action.kind === 'delete') {
        await softDelete.mutateAsync({ id: listingId, domain });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setBusyId(null);
    }
  };

  if (!actions.length) return null;

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => {
          const busy = busyId === action.id;
          if (action.kind === 'navigate') {
            return (
              <Link key={action.id} href={action.href}>
                <Button variant={action.variant} size="sm" disabled={busy}>
                  {action.label}
                </Button>
              </Link>
            );
          }
          return (
            <Button
              key={action.id}
              type="button"
              variant={action.variant}
              size="sm"
              disabled={Boolean(busyId)}
              onClick={() => void run(action)}
            >
              {busy ? '…' : action.label}
            </Button>
          );
        })}
      </div>
      {error ? <p className="mt-2 text-xs text-error">{error}</p> : null}
    </div>
  );
}
