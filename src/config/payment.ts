/**
 * Card-to-card payment configuration.
 * Replace these placeholders with the real receiving card details.
 * These values are shown to buyers in the order summary.
 */
export const payment = {
  /** The card number buyers transfer the ticket price to. */
  cardNumber: '6037-9973-0000-0000',
  /** Cardholder name shown to buyers. */
  cardHolder: 'نام دارنده کارت',
  /** Optional bank name; leave empty to hide. */
  bankName: '',
} as const;
