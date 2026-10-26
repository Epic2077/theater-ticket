import type { BookingRequest, BookingResult } from '../types';

/**
 * Booking service — the ONLY place the UI talks to for submissions.
 *
 * DEMO MODE (default): no backend exists yet. Submissions are simulated
 * locally and the returned reference is prefixed "DEMO-" so it can never
 * be mistaken for a real reservation. Nothing is paid, reserved or issued.
 *
 * To connect a real backend: set `demoMode: false`, point `endpoint` at your
 * API, and have the server re-validate input, recalculate prices, reserve
 * inventory and return the authoritative booking reference.
 */
export const bookingServiceConfig = {
  demoMode: true,
  endpoint: '/api/bookings',
  simulatedLatencyMs: 1200,
  /** Flip to true to exercise the failure state during development. */
  simulateFailure: false,
};

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function generateDemoReference(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `DEMO-${suffix}`;
}

export async function submitBooking(request: BookingRequest): Promise<BookingResult> {
  if (bookingServiceConfig.demoMode) {
    await delay(bookingServiceConfig.simulatedLatencyMs);
    if (bookingServiceConfig.simulateFailure) {
      throw new Error('خطای شبیه‌سازی‌شده: اتصال به سامانه رزرو برقرار نشد.');
    }
    return {
      reference: generateDemoReference(),
      status: 'demo',
      statusNote: 'نسخهٔ نمایشی — هیچ پرداختی انجام نشده و صندلی‌ای رزرو نشده است.',
    };
  }

  const response = await fetch(bookingServiceConfig.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    throw new Error('ثبت سفارش ناموفق بود. لطفاً دوباره تلاش کنید.');
  }
  return (await response.json()) as BookingResult;
}
