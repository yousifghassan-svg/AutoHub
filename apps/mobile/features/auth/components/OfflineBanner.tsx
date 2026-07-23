import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Text, useTheme } from '@autohub/mobile-ui';
import { isOnline } from '@/lib/network';

export function OfflineBanner() {
  const theme = useTheme();
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let mounted = true;
    const tick = async () => {
      const online = await isOnline();
      if (mounted) setOffline(!online);
    };
    tick();
    const id = setInterval(tick, 4000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  if (!offline) return null;

  return (
    <View
      style={{
        backgroundColor: theme.colors.warningSoft,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
      }}
    >
      <Text variant="caption" style={{ color: theme.colors.warning, textAlign: 'center' }}>
        You are offline. Some actions will be unavailable.
      </Text>
    </View>
  );
}
