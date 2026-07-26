import { FlatList, Pressable, View } from 'react-native';
import { Card, Text, useTheme } from '@autohub/mobile-ui';
import type { DealerCard } from '@/src/types/marketplace';

export function DealersRail({
  title,
  dealers,
  loading,
  onPressDealer,
}: {
  title: string;
  dealers: DealerCard[];
  loading?: boolean;
  onPressDealer?: (dealer: DealerCard) => void;
}) {
  const theme = useTheme();

  if (!loading && dealers.length === 0) return null;

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <Text variant="h3" style={{ paddingHorizontal: theme.layout.gutter }}>
        {title}
      </Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={dealers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: theme.layout.gutter,
          gap: theme.spacing.md,
        }}
        renderItem={({ item }) => (
          <Pressable onPress={() => onPressDealer?.(item)}>
            <Card
              style={{
                width: 160,
                padding: theme.spacing.md,
                gap: theme.spacing.xs,
              }}
            >
              <Text variant="label" numberOfLines={1}>
                {item.name}
              </Text>
              <Text variant="caption" color="secondary" numberOfLines={1}>
                {item.cityName ?? (item.verified ? 'Verified dealer' : 'Dealer')}
              </Text>
            </Card>
          </Pressable>
        )}
      />
    </View>
  );
}
