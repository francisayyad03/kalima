import { ANSWERS } from '../data/answers';
import { ANSWERS_DISPLAY } from '../data/answersDisplay';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const START_DAY_UTC = Date.UTC(2024, 0, 1) / MS_PER_DAY;

/**
 * Returns an integer day index since a fixed start date.
 * This guarantees the same word for everyone on the same day.
 */
function getDayIndex(dayId: string): number {
  const [y, m, d] = dayId.split('-').map(Number);
  // Use UTC day ordinals so DST changes do not duplicate/skip indices.
  const dayUtc = Date.UTC(y, m - 1, d) / MS_PER_DAY;
  return Math.floor(dayUtc - START_DAY_UTC);
}

/**
 * Pick the daily answer deterministically.
 */
export function getDailyWord(dayID: string): string {
  const index = getDayIndex(dayID) % ANSWERS.length;
  return ANSWERS[index];
}

export function getDailyWordDisplay(dayID: string): string {
  const index = getDayIndex(dayID) % ANSWERS_DISPLAY.length;
  return ANSWERS_DISPLAY[index];
}
