import { FlatList, Pressable, View } from 'react-native';
import { Text, useTheme } from '@autohub/mobile-ui';

export type OptionItem = {
  id: string;
  label: string;
  subtitle?: string;
};

export function OptionPicker({
  options,
  selectedId,
  onSelect,
}: {
  options: OptionItem[];
  selectedId?: string | null;
  onSelect: (item: OptionItem) => void;
}) {
  const theme = useTheme();

  return (
    <FlatList
      data={options}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ gap: theme.spacing.sm, paddingBottom: theme.spacing.xl }}
      renderItem={({ item }) => {
        const selected = item.id === selectedId;
        return (
          <Pressable
            onPress={() => onSelect(item)}
            style={{
              padding: theme.spacing.lg,
              borderRadius: theme.radii.lg,
              borderWidth: 1,
              borderColor: selected ? theme.colors.primary : theme.colors.border,
              backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
              gap: 2,
            }}
          >
            <Text variant="label" color={selected ? 'brand' : 'primary'}>
              {item.label}
            </Text>
            {item.subtitle ? (
              <Text variant="caption" color="secondary">
                {item.subtitle}
              </Text>
            ) : null}
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <View style={{ padding: theme.spacing.lg }}>
          <Text variant="body" color="secondary">
            No options available.
          </Text>
        </View>
      }
    />
  );
}
