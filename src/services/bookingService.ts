import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { startZarinpalPayment } from './paymentService';
import type { BookingRequest, BookingResult } from '../types';

/**
 * Booking service — the ONLY place the UI talks to for submissions.
 *
 * When Supabase is configured (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY in
 * `.env`), a booking is INSERTed as `pending`, then the buyer is redirected to
 * the Zarinpal payment page (see paymentService.ts). Prices and the reference
 * are authoritative on the server: prices are recalculated by a trigger and the
 * reference is constrained to be unique.
 *
 * Without configuration the service falls back to DEMO MODE so the site still
 * runs during development: the reference is prefixed "DEMO-" and nothing is
 * paid, reserved or issued.
 */
const REFERENCE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const MAX_REFERENCE_ATTEMPTS = 3;
const UNIQUE_VIOLATION = '23505';

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function generateReference(): string {
  let suffix = '';
  for (let i = 0; i < 8; i++) {
    suffix += REFERENCE_ALPHABET[Math.floor(Math.random() * REFERENCE_ALPHABET.length)];
  }
  return `TKT-${suffix}`;
}

function generateDemoReference(): string {
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += REFERENCE_ALPHABET[Math.floor(Math.random() * REFERENCE_ALPHABET.length)];
  }
  return `DEMO-${suffix}`;
}

export async function submitBooking(request: BookingRequest): Promise<BookingResult> {
  if (!isSupabaseConfigured || !supabase) {
    await delay(1200);
    return {
      reference: generateDemoReference(),
      status: 'demo',
      statusNote: 'نسخهٔ نمایشی — هیچ پرداختی انجام نشده و صندلی‌ای رزرو نشده است.',
    };
  }

  const row = {
    first_name: request.firstName,
    last_name: request.lastName,
    phone: request.phone,
    quantity: request.quantity,
    is_student: request.isStudent,
    student_code: request.studentCode || null,
    performance_id: request.performanceId,
    performance_date: request.performanceDateISO,
    showtime_id: request.showtimeId,
    showtime_time: request.showtimeTime,
    status: 'pending',
    status_note: 'در انتظار پرداخت',
  };

  for (let attempt = 1; attempt <= MAX_REFERENCE_ATTEMPTS; attempt++) {
    const reference = generateReference();
    const { error } = await supabase
      .from('bookings')
      .insert({ reference, ...row });

    if (!error) {
      const { url } = await startZarinpalPayment(reference);
      return {
        reference,
        status: 'pending_payment',
        statusNote: 'در انتظار پرداخت — در حال انتقال به درگاه پرداخت…',
        paymentUrl: url,
      };
    }

    // Unique-constraint collision on the random ticket code — retry with a fresh one.
    if (error.code !== UNIQUE_VIOLATION) {
      throw new Error('ثبت سفارش ناموفق بود. لطفاً دوباره تلاش کنید.');
    }
  }

  throw new Error('ثبت سفارش ناموفق بود. لطفاً دوباره تلاش کنید.');
}
