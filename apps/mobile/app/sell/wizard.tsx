import { useEffect } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Text, useTheme } from '@autohub/mobile-ui';

/**
 * Legacy sell wizard entry — deprecated in P5-5.
 * New flows use /sell/vehicle and /sell/plate (create draft stores).
 * Redirect so we do not write competing `autohub.sell.drafts` entries.
 */
export default function LegacySellWizardRedirect() {
  const theme = useTheme();

  useEffect(() => {
    router.replace('/sell' as never);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.background,
        padding: theme.spacing.lg,
      }}
    >
      <Text variant="body" color="secondary">
        Redirecting to Sell hub…
      </Text>
    </View>
  );
}
