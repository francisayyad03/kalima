import { getLocalDayId } from '../utils/day';

export const REMINDER_HOUR = 20;
export const REMINDER_MINUTE = 0;
export const REMINDER_WINDOW_DAYS = 14;

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function getReminderDate(baseDate: Date, offsetDays: number) {
  const reminderDate = addDays(baseDate, offsetDays);
  reminderDate.setHours(REMINDER_HOUR, REMINDER_MINUTE, 0, 0);
  return reminderDate;
}

export function shouldScheduleToday(now: Date, lastCompletedDayId: string | null | undefined) {
  const today = getLocalDayId(now);
  const todayReminder = getReminderDate(now, 0);

  if (lastCompletedDayId === today) {
    return false;
  }

  return now < todayReminder;
}

export function buildReminderDates(
  now: Date,
  lastCompletedDayId: string | null | undefined,
  windowDays = REMINDER_WINDOW_DAYS
) {
  const firstOffset = shouldScheduleToday(now, lastCompletedDayId) ? 0 : 1;
  return Array.from({ length: windowDays }, (_, index) => getReminderDate(now, firstOffset + index));
}
