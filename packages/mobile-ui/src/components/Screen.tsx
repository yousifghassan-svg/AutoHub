import React from 'react';
import { ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export type ScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Responsive shell: gutters adapt by breakpoint; respects RTL via theme.
 * Wrap the app with SafeAreaProvider (Expo Router does this by default).
 */
export function Screen({ children, scroll = false, padded = true, style }: ScreenProps) {
  const theme = useTheme();
  const contentStyle: ViewStyle = {
    flexGrow: 1,
    paddingHorizontal: padded ? theme.layout.gutter : 0,
    paddingVertical: padded ? theme.spacing.lg : 0,
    maxWidth: theme.layout.contentMaxWidth,
    width: '100%',
    alignSelf: 'center',
  };

  if (scroll) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ScrollView contentContainerStyle={[contentStyle, style]}>{children}</ScrollView>
      </View>
    );
  }

  return (
    <View style={[{ flex: 1, backgroundColor: theme.colors.background }, contentStyle, style]}>
      {children}
    </View>
  );
}
