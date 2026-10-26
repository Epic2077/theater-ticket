/** Persian-friendly formatting helpers. */

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

/** Convert Latin digits in any string/number to Persian digits. */
export function toPersianDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

/** "350000" → "۳۵۰٬۰۰۰ تومان" */
export function formatCurrency(amount: number, currency: string): string {
  return `${new Intl.NumberFormat('fa-IR').format(amount)} ${currency}`;
}

/**
 * "2026-11-06" → «جمعه ۱۵ آبان ۱۴۰۵» (Persian calendar via Intl).
 */
export function formatPerformanceDate(dateISO: string, style: 'full' | 'short' = 'full'): string {
  const date = new Date(`${dateISO}T12:00:00`);
  const options: Intl.DateTimeFormatOptions =
    style === 'full'
      ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
      : { weekday: 'long', day: 'numeric', month: 'long' };
  return new Intl.DateTimeFormat('fa-IR', options).format(date);
}

/** Gregorian companion date, kept LTR for machine-style contexts (ticket stub). */
export function formatGregorianDate(dateISO: string): string {
  const date = new Date(`${dateISO}T12:00:00`);
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

/** "19:00" → "۱۹:۰۰" (display only; storage stays "HH:MM"). */
export function formatTime(time: string): string {
  return toPersianDigits(time);
}
