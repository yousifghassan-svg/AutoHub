import { Pressable, View } from 'react-native';
import { Icon, Text, useTheme, type IconName } from '@autohub/mobile-ui';

export function MenuRow({
  label,
  subtitle,
  icon,
  onPress,
}: {
  label: string;
  subtitle?: string;
  icon: IconName;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.75 : 1,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.radii.lg,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        flexDirection: theme.isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
      })}
    >
      <Icon name={icon} size={22} color={theme.colors.primary} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="label">{label}</Text>
        {subtitle ? (
          <Text variant="caption" color="secondary">
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Icon
        name={theme.isRTL ? 'chevron-back' : 'chevron-forward'}
        size={18}
        color={theme.colors.textSecondary}
      />
    </Pressable>
  );
}
