import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('care', {
      name: 'Plant care reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

/** Schedule a local notification at 9:00 on the given due date (or in 1 minute if that has passed). */
export async function scheduleCareNotification(title: string, body: string, due: Date): Promise<string | undefined> {
  if (Platform.OS === 'web') return undefined;
  const at = new Date(due);
  at.setHours(9, 0, 0, 0);
  if (at.getTime() <= Date.now()) at.setTime(Date.now() + 60_000);
  try {
    return await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: 'care' },
    });
  } catch {
    return undefined;
  }
}

export async function cancelNotification(id?: string) {
  if (!id || Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // already fired or removed
  }
}
