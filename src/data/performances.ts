import type { Performance, Showtime } from '../types';

/**
 * Performance schedule configuration.
 *
 * The list is GENERATED from this schedule so dates never fall in the past:
 * performances run on the given weekdays, for the given number of weeks,
 * starting from the first matching day after today.
 *
 * To hard-code specific dates instead, replace `performances` with a literal
 * array of { id, dateISO: 'YYYY-MM-DD', showtimes } entries.
 */
export const schedule = {
  /** JavaScript weekday numbers: 0 = Sunday … 4 = Thursday, 5 = Friday. */
  weekdays: [4, 5],
  /** How many weeks of performances to offer. */
  weeks: 4,
  showtimes: [
    { id: 'evening', time: '19:00', label: 'سانس عصر' },
    { id: 'night', time: '21:30', label: 'سانس شب' },
  ] satisfies Showtime[],
};

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function buildPerformances(): Performance[] {
  const result: Performance[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  // Start from tomorrow — same-day booking is not offered in this demo.
  cursor.setDate(cursor.getDate() + 1);

  const weeksFound = new Set<number>();
  // Guard against infinite loops while scanning ahead.
  for (let i = 0; i < 370 && weeksFound.size < schedule.weeks; i++) {
    const day = new Date(cursor);
    day.setDate(day.getDate() + i);
    if (!schedule.weekdays.includes(day.getDay())) continue;

    // "Week index" = number of distinct ISO weeks seen so far.
    const weekIndex = Math.floor((day.getTime() - cursor.getTime()) / (7 * 24 * 3600 * 1000));
    weeksFound.add(weekIndex);
    if (weekIndex >= schedule.weeks) break;

    result.push({
      id: `perf-${toISODate(day)}`,
      dateISO: toISODate(day),
      showtimes: schedule.showtimes,
    });
  }
  return result;
}

export const performances: Performance[] = buildPerformances();

export function findPerformance(id: string): Performance | undefined {
  return performances.find((p) => p.id === id);
}

export function findShowtime(performance: Performance | undefined, id: string): Showtime | undefined {
  return performance?.showtimes.find((s) => s.id === id);
}
