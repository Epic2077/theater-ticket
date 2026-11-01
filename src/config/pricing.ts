/**
 * Centralized pricing configuration — the single source of truth.
 * All displayed and computed amounts derive from these values.
 */
export const pricing = {
  /** Regular (non-student) ticket price. */
  regularTicketPrice: 125_000,
  /** Student ticket price. */
  studentTicketPrice: 85_000,
  /** Price for a free ticket (special code). */
  freeTicketPrice: 0,
  /** Maximum tickets allowed per order. */
  maxTicketsPerOrder: 6,
  /** Currency label shown next to amounts. */
  currency: 'تومان',
  /** Special code that makes a ticket free. */
  freeCode: '919392077',
  /** Valid student code: exactly 8 digits starting with 390–404. */
  studentCodePattern: /^(39\d|40[0-4])\d{5}$/,
} as const;

export type Pricing = typeof pricing;

export function unitPrice(rate: 'regular' | 'student' | 'free'): number {
  if (rate === 'student') return pricing.studentTicketPrice;
  if (rate === 'free') return pricing.freeTicketPrice;
  return pricing.regularTicketPrice;
}

export function totalPriceFor(rates: ('regular' | 'student' | 'free')[]): number {
  return rates.reduce((sum, rate) => sum + unitPrice(rate), 0);
}
