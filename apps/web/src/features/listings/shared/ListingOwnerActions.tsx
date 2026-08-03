'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button, Modal } from '@/components/ui';
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
  categoryCode,
  surface,
  onPreview,
  className,
}: {
  listingId: string;
  status: string | null | undefined;
  domain: MarketplaceDomainCode;
  categoryCode?: string | null;
  surface: ListingActionsContext['surface'];
  onPreview?: () => void;
  className?: string;
}) {
  const { changeStatus, softDelete } = useDomainMutations();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [comingSoon, setComingSoon] = useState<string | null>(null);

  const actions = ListingActions.getActions(status, {
    isOwner: true,
    listingId,
    domain,
    categoryCode,
    surface,
  });

  const run = async (action: ListingAction) => {
    setError(null);
    setComingSoon(null);

    if (action.kind === 'coming_soon') {
      setComingSoon('Duplicate will be available in a future update.');
      return;
    }
    if (action.kind === 'preview') {
      onPreview?.();
      return;
    }
    if (action.kind === 'navigate') return;
    if (action.kind === 'delete') {
      setPendingDelete(true);
      return;
    }

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
          await changeStatus.mutateAsync({
            id: listingId,
            status: 'DRAFT',
            domain,
          });
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
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    setBusyId('delete');
    setError(null);
    try {
      await softDelete.mutateAsync({ id: listingId, domain });
      setPendingDelete(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Couldn’t delete listing');
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
              <Link key={action.id} href={action.href!}>
                <Button variant={action.variant} size="sm" disabled={Boolean(busyId)}>
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
      {comingSoon ? (
        <p className="mt-2 text-xs text-ink-secondary">{comingSoon}</p>
      ) : null}
      {error ? <p className="mt-2 text-xs text-error">{error}</p> : null}

      <Modal
        open={pendingDelete}
        title="Delete this listing?"
        onClose={() => {
          if (!busyId) setPendingDelete(false);
        }}
      >
        <p className="text-sm text-ink-secondary">
          This removes the listing from your dashboard. You can cancel if you
          changed your mind.
        </p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={busyId === 'delete'}
            onClick={() => setPendingDelete(false)}
          >
            Keep listing
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={busyId === 'delete'}
            onClick={() => void confirmDelete()}
          >
            {busyId === 'delete' ? 'Deleting…' : 'Delete listing'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
