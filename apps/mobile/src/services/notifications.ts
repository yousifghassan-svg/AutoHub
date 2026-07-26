import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/** Request push permission — foundation only (no backend device registry yet). */
export async function ensureNotificationPermissions(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.status === Notifications.PermissionStatus.GRANTED) {
    return true;
  }
  const next = await Notifications.requestPermissionsAsync();
  return next.granted || next.status === Notifications.PermissionStatus.GRANTED;
}

export async function getExpoPushTokenSafe(): Promise<string | null> {
  try {
    const granted = await ensureNotificationPermissions();
    if (!granted) return null;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  } catch {
    return null;
  }
}
