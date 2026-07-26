import { View } from 'react-native';
import { BottomSheet, Button, Text, useTheme } from '@autohub/mobile-ui';
import type { ManagedItem, ManageActionKey } from '../domain/types';

export function ManageActionsSheet({
  item,
  visible,
  busy,
  onClose,
  onAction,
}: {
  item: ManagedItem | null;
  visible: boolean;
  busy?: boolean;
  onClose: () => void;
  onAction: (action: ManageActionKey) => void;
}) {
  const theme = useTheme();
  if (!item) return null;

  const canEdit = item.status !== 'SOLD' && item.status !== 'ARCHIVED';
  const canRepublish =
    item.status === 'DRAFT' ||
    item.status === 'REJECTED' ||
    item.status === 'ARCHIVED' ||
    item.status === 'EXPIRED';
  const canPause = item.status === 'ACTIVE' || item.status === 'PENDING' || item.status === 'RESERVED';
  const canActivate = item.status === 'RESERVED' || item.status === 'ARCHIVED';

  return (
    <BottomSheet visible={visible} title="Manage listing" onClose={onClose}>
      <View style={{ gap: theme.spacing.sm }}>
        <Text variant="body" color="secondary" numberOfLines={2}>
          {item.title} · {item.status}
        </Text>
        <Button variant="secondary" disabled={busy} onPress={() => onAction('view')}>
          Open
        </Button>
        {canEdit ? (
          <Button variant="secondary" disabled={busy} onPress={() => onAction('edit')}>
            Edit
          </Button>
        ) : null}
        <Button variant="secondary" disabled={busy} onPress={() => onAction('share')}>
          Share
        </Button>
        <Button variant="secondary" disabled={busy} onPress={() => onAction('duplicate')}>
          Duplicate
        </Button>
        {canRepublish ? (
          <Button disabled={busy} onPress={() => onAction('republish')}>
            Republish
          </Button>
        ) : null}
        {canPause ? (
          <Button variant="ghost" disabled={busy} onPress={() => onAction('pause')}>
            Pause
          </Button>
        ) : null}
        {canActivate ? (
          <Button variant="secondary" disabled={busy} onPress={() => onAction('activate')}>
            Activate
          </Button>
        ) : null}
        {item.status === 'ACTIVE' || item.status === 'RESERVED' ? (
          <Button disabled={busy} onPress={() => onAction('markSold')}>
            Mark sold
          </Button>
        ) : null}
        <Button variant="danger" disabled={busy} onPress={() => onAction('delete')}>
          Delete
        </Button>
      </View>
    </BottomSheet>
  );
}
