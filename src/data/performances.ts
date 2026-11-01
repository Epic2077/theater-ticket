import type { Performance, Showtime } from '../types';

/**
 * Fixed performance schedule.
 * Three nights — 11, 12 and 13 Aban — each with a single showtime at 19:00.
 * Dates are stored as ISO Gregorian ("YYYY-MM-DD"); the UI renders them with
 * the Persian calendar via `formatPerformanceDate`.
 */
const showtimes: Showtime[] = [
  { id: 'evening', time: '19:00', label: 'سانس عصر' },
];

export const performances: Performance[] = [
  { id: 'perf-2026-11-02', dateISO: '2026-11-02', showtimes }, // ۱۱ آبان
  { id: 'perf-2026-11-03', dateISO: '2026-11-03', showtimes }, // ۱۲ آبان
  { id: 'perf-2026-11-04', dateISO: '2026-11-04', showtimes }, // ۱۳ آبان
];

export function findPerformance(id: string): Performance | undefined {
  return performances.find((p) => p.id === id);
}

export function findShowtime(
  performance: Performance | undefined,
  id: string,
): Showtime | undefined {
  return performance?.showtimes.find((s) => s.id === id);
}

