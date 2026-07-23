import { EmptyState, Screen } from '@autohub/mobile-ui';
import { OfflineBanner } from '@/features/auth/components/OfflineBanner';

export default function NotificationsPlaceholderScreen() {
  return (
    <Screen>
      <OfflineBanner />
      <EmptyState
        icon="notifications-outline"
        title="Notifications"
        description="Alerts and messages arrive in a later sprint. No chat yet."
      />
    </Screen>
  );
}
