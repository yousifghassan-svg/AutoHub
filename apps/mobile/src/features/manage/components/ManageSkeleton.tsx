import { View } from 'react-native';
import { useTheme } from '@autohub/mobile-ui';

function Block({ height, width = '100%' as const }: { height: number; width?: number | `${number}%` }) {
  const theme = useTheme();
  return (
    <View
      style={{
        height,
        width,
        borderRadius: theme.radii.md,
        backgroundColor: theme.colors.surfaceMuted,
      }}
    />
  );
}

export function ManageSkeleton() {
  const theme = useTheme();
  return (
    <View style={{ padding: theme.layout.gutter, gap: theme.spacing.md }}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{
            borderRadius: theme.radii.lg,
            borderWidth: 1,
            borderColor: theme.colors.border,
            overflow: 'hidden',
            flexDirection: 'row',
          }}
        >
          <Block height={110} width={110} />
          <View style={{ flex: 1, padding: theme.spacing.md, gap: theme.spacing.sm }}>
            <Block height={16} width={80} />
            <Block height={18} />
            <Block height={16} width={100} />
          </View>
        </View>
      ))}
    </View>
  );
}
