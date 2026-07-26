import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { Badge, Button, Icon, Text, useTheme } from '@autohub/mobile-ui';
import { formatPrice } from '@/features/home/domain/mappers';
import type { ManagedItem, ManageStatus } from '../domain/types';

const STATUS_TONE: Record<
  ManageStatus,
  'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info'
> = {
  DRAFT: 'neutral',
  PENDING: 'warning',
  ACTIVE: 'success',
  RESERVED: 'info',
  REJECTED: 'error',
  SOLD: 'brand',
  EXPIRED: 'warning',
  ARCHIVED: 'neutral',
};

const STATUS_LABEL: Record<ManageStatus, string> = {
  DRAFT: 'Draft',
  PENDING: 'Pending',
  ACTIVE: 'Published',
  RESERVED: 'Reserved',
  REJECTED: 'Rejected',
  SOLD: 'Sold',
  EXPIRED: 'Expired',
  ARCHIVED: 'Archived',
};

export function ManageItemCard({
  item,
  onPress,
  onManage,
}: {
  item: ManagedItem;
  onPress: () => void;
  onManage: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: theme.radii.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        overflow: 'hidden',
      }}
    >
      <View style={{ flexDirection: theme.isRTL ? 'row-reverse' : 'row' }}>
        <View style={{ width: 110, height: 110, backgroundColor: theme.colors.surfaceMuted }}>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Icon
                name={item.domain === 'PLATE' ? 'grid-outline' : 'car-sport-outline'}
                color={theme.colors.textSecondary}
              />
            </View>
          )}
        </View>
        <View style={{ flex: 1, padding: theme.spacing.md, gap: theme.spacing.xs }}>
          <Badge tone={STATUS_TONE[item.status]}>{STATUS_LABEL[item.status]}</Badge>
          <Text variant="label" numberOfLines={2}>
            {item.title}
          </Text>
          <Text variant="body" color="brand">
            {formatPrice(item.price, item.currencyCode)}
          </Text>
          <Text variant="caption" color="secondary" numberOfLines={1}>
            {item.location || '—'}
          </Text>
        </View>
      </View>
      <View style={{ padding: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
        <Button size="sm" variant="secondary" onPress={onManage} fullWidth>
          Manage
        </Button>
      </View>
    </Pressable>
  );
}
