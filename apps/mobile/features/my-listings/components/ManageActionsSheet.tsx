import React from 'react';
import { View } from 'react-native';
import { BottomSheet, Button, Text, useTheme } from '@autohub/mobile-ui';
import { OWNER_TRANSITIONS, type ManagedListing } from '../domain/types';

export type ManageAction =
  | 'edit'
  | 'duplicate'
  | 'archive'
  | 'delete'
  | 'renew'
  | 'markSold'
  | 'reserve'
  | 'submitReview'
  | 'withdraw'
  | 'unreserve'
  | 'stats'
  | 'view';

export function ManageActionsSheet({
  listing,
  visible,
  busy,
  onClose,
  onAction,
}: {
  listing: ManagedListing | null;
  visible: boolean;
  busy?: boolean;
  onClose: () => void;
  onAction: (action: ManageAction) => void;
}) {
  const theme = useTheme();
  if (!listing) return null;

  const transitions = OWNER_TRANSITIONS[listing.status];
  const canEdit = listing.status !== 'SOLD' && listing.status !== 'ARCHIVED';

  return (
    <BottomSheet visible={visible} title="Manage listing" onClose={onClose}>
      <View style={{ gap: theme.spacing.sm }}>
        <Text variant="body" color="secondary" numberOfLines={2}>
          {listing.title}
        </Text>

        <Button variant="secondary" disabled={busy} onPress={() => onAction('view')}>
          Open listing
        </Button>
        <Button variant="secondary" disabled={busy} onPress={() => onAction('stats')}>
          View statistics
        </Button>
        {canEdit ? (
          <Button variant="secondary" disabled={busy} onPress={() => onAction('edit')}>
            Edit
          </Button>
        ) : null}
        <Button variant="secondary" disabled={busy} onPress={() => onAction('duplicate')}>
          Duplicate
        </Button>
        <Button variant="secondary" disabled={busy} onPress={() => onAction('renew')}>
          Renew (new draft)
        </Button>

        {transitions.includes('PENDING') ? (
          <Button disabled={busy} onPress={() => onAction('submitReview')}>
            Submit for review
          </Button>
        ) : null}
        {transitions.includes('DRAFT') ? (
          <Button variant="ghost" disabled={busy} onPress={() => onAction('withdraw')}>
            Withdraw to draft
          </Button>
        ) : null}
        {transitions.includes('RESERVED') ? (
          <Button variant="secondary" disabled={busy} onPress={() => onAction('reserve')}>
            Mark reserved
          </Button>
        ) : null}
        {transitions.includes('ACTIVE') && listing.status === 'RESERVED' ? (
          <Button variant="secondary" disabled={busy} onPress={() => onAction('unreserve')}>
            Mark active again
          </Button>
        ) : null}
        {transitions.includes('SOLD') ? (
          <Button disabled={busy} onPress={() => onAction('markSold')}>
            Mark as sold
          </Button>
        ) : null}
        {transitions.includes('ARCHIVED') ? (
          <Button variant="ghost" disabled={busy} onPress={() => onAction('archive')}>
            Archive
          </Button>
        ) : null}

        <Button variant="danger" disabled={busy} onPress={() => onAction('delete')}>
          Delete (soft)
        </Button>
      </View>
    </BottomSheet>
  );
}
