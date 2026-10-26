/**
 * Centralized pricing configuration — the single source of truth.
 * All displayed and computed amounts derive from these values.
 * Replace the placeholder prices with the theater's real prices.
 */
export const pricing = {
  /** Standard ticket price (placeholder). */
  regularTicketPrice: 350_000,
  /** Student ticket price (placeholder). */
  studentTicketPrice: 220_000,
  /** Maximum tickets allowed per order. */
  maxTicketsPerOrder: 6,
  /** Currency label shown next to amounts. */
  currency: 'تومان',
} as const;

export type Pricing = typeof pricing;

export function unitPrice(isStudent: boolean): number {
  return isStudent ? pricing.studentTicketPrice : pricing.regularTicketPrice;
}

export function totalPrice(quantity: number, isStudent: boolean): number {
  return quantity * unitPrice(isStudent);
}
