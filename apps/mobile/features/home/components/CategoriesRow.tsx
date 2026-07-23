import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Chip, Skeleton, Text, useTheme } from '@autohub/mobile-ui';
import type { CategoryItem } from '../domain/types';

export type CategoriesRowProps = {
  categories: CategoryItem[];
  loading?: boolean;
  selectedCode?: string;
  locale?: 'ar' | 'ku' | 'en';
  onSelect: (category: CategoryItem) => void;
};

export function CategoriesRow({
  categories,
  loading,
  selectedCode,
  locale = 'ar',
  onSelect,
}: CategoriesRowProps) {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <Text variant="h3" style={{ paddingHorizontal: theme.layout.gutter }}>
        Categories
      </Text>
      {loading ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: theme.layout.gutter,
            gap: theme.spacing.sm,
            flexDirection: theme.isRTL ? 'row-reverse' : 'row',
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} width={88} height={36} radius={999} />
          ))}
        </ScrollView>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: theme.layout.gutter,
            gap: theme.spacing.sm,
            flexDirection: theme.isRTL ? 'row-reverse' : 'row',
          }}
        >
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              label={locale === 'en' ? cat.nameEn : cat.nameAr}
              selected={selectedCode === cat.code}
              onPress={() => onSelect(cat)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

export function SearchBarEntry({
  placeholder,
  onPress,
}: {
  placeholder: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="search"
      onPress={onPress}
      style={{
        marginHorizontal: theme.layout.gutter,
        minHeight: 48,
        borderRadius: theme.radii.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.spacing.lg,
        justifyContent: 'center',
      }}
    >
      <Text variant="body" color="secondary">
        {placeholder}
      </Text>
    </Pressable>
  );
}
