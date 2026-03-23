import assert from 'node:assert/strict';
import {
  REMINDER_HOUR,
  REMINDER_MINUTE,
  REMINDER_WINDOW_DAYS,
  buildReminderDates,
} from '../src/notifications/reminderPlan';
import { getLocalDayId } from '../src/utils/day';

function localDate(value: string) {
  return new Date(value);
}

function assertReminder(date: Date, expectedDayId: string) {
  assert.equal(date.getHours(), REMINDER_HOUR);
  assert.equal(date.getMinutes(), REMINDER_MINUTE);
  assert.equal(getLocalDayId(date), expectedDayId);
}

function run() {
  const beforeEight = localDate('2026-03-23T10:15:00');
  const afterEight = localDate('2026-03-23T20:15:00');

  const normalPlan = buildReminderDates(beforeEight, '2026-03-22');
  assert.equal(normalPlan.length, REMINDER_WINDOW_DAYS);
  assertReminder(normalPlan[0], '2026-03-23');
  assertReminder(normalPlan[13], '2026-04-05');

  const completedTodayPlan = buildReminderDates(beforeEight, '2026-03-23');
  assert.equal(completedTodayPlan.length, REMINDER_WINDOW_DAYS);
  assertReminder(completedTodayPlan[0], '2026-03-24');
  assertReminder(completedTodayPlan[13], '2026-04-06');

  // Regression test for the original bug:
  // completing today's game before 8 PM used to clear the repeating reminder
  // and leave no reminder for tomorrow unless the app was reopened.
  assert.notEqual(getLocalDayId(completedTodayPlan[0]), '2026-03-23');
  assertReminder(completedTodayPlan[1], '2026-03-25');

  const latePlan = buildReminderDates(afterEight, '2026-03-22');
  assert.equal(latePlan.length, REMINDER_WINDOW_DAYS);
  assertReminder(latePlan[0], '2026-03-24');
  assertReminder(latePlan[13], '2026-04-06');

  const completedTodayLatePlan = buildReminderDates(afterEight, '2026-03-23');
  assert.equal(completedTodayLatePlan.length, REMINDER_WINDOW_DAYS);
  assertReminder(completedTodayLatePlan[0], '2026-03-24');

  console.log('Reminder plan tests passed.');
}

run();
