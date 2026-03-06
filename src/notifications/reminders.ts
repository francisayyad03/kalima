import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { loadStats } from '../game/storage';
import { diffDays, getLocalDayId } from '../utils/day';

const REMINDER_IDS_KEY = 'arabicwordle.reminderIds.v1';
const TEST_MESSAGES = [
  'جاهز لأول تحدّي؟ ابدأ لعبة اليوم الآن ✨',
  'لا تخسر سلسلتك الحالية! العب الآن 🔥',
  'سلسلتك قوية! حافظ عليها بكلمة اليوم 💪',
  'ابدأ سلسلة جديدة اليوم. كلمة واحدة تكفي 🚀',
];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function pickDailyMessageFromStats() {
  const stats = await loadStats();

  if (!stats || stats.gamesPlayed === 0) {
    return 'جاهز لأول تحدّي؟ ابدأ لعبة اليوم الآن ✨';
  }

  const today = getLocalDayId();
  const lastCompleted = stats.lastCompletedDayId;
  const daysSinceLastPlay = lastCompleted ? diffDays(today, lastCompleted) : null;

  if (stats.currentStreak > 0 && daysSinceLastPlay !== null && daysSinceLastPlay >= 1) {
    return `لا تخسر سلسلتك الحالية! العب الآن 🔥`;
  }

  if (stats.currentStreak > 0) {
    return `سلسلتك قوية! حافظ عليها بكلمة اليوم 💪`;
  }

  return 'ابدأ سلسلة جديدة اليوم. كلمة واحدة تكفي 🚀';
}

async function ensureAndroidChannelAsync() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('daily-reminders', {
    name: 'تذكيرات يومية',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

async function requestNotificationPermissionAsync() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted || requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

async function cancelExistingReminderSchedulesAsync() {
  const raw = await AsyncStorage.getItem(REMINDER_IDS_KEY);
  if (!raw) return;

  const ids = JSON.parse(raw) as string[];
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));
}

async function scheduleReminderNotificationsAsync() {
  const stats = await loadStats();
  const today = getLocalDayId();

  // Do not schedule reminders for days already completed.
  if (stats?.lastCompletedDayId === today) {
    await AsyncStorage.setItem(REMINDER_IDS_KEY, JSON.stringify([]));
    return;
  }

  const body = await pickDailyMessageFromStats();

  const dailyId = await Notifications.scheduleNotificationAsync({
    content: {
      body,
      sound: false,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 0,
    },
  });
  await AsyncStorage.setItem(REMINDER_IDS_KEY, JSON.stringify([dailyId]));
}

export async function setupReminderNotificationsAsync() {
  try {
    await ensureAndroidChannelAsync();

    const allowed = await requestNotificationPermissionAsync();
    if (!allowed) return;

    await cancelExistingReminderSchedulesAsync();
    await scheduleReminderNotificationsAsync();
  } catch {
    // Ignore notification setup failures to avoid blocking app startup.
  }
}

export async function showcaseAllReminderMessagesForTestingAsync() {
  try {
    const allowed = await requestNotificationPermissionAsync();
    if (!allowed) return;

    await ensureAndroidChannelAsync();

    await Promise.all(
      TEST_MESSAGES.map((body, index) =>
        Notifications.scheduleNotificationAsync({
          content: {
            body,
            sound: false,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 2 + index * 2,
            repeats: false,
          },
        })
      )
    );
  } catch {
    // Ignore testing errors.
  }
}
