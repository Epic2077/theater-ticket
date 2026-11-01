import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { unitPrice } from '../config/pricing';
import { classifyStudentCode } from '../utils/studentCode';
import type { AttendeeRow, BookingRequest, BookingResult } from '../types';

/**
 * Booking service — the ONLY place the UI talks to for submissions.
 *
 * When Supabase is configured, a booking is INSERTed as `paid` with the full
 * attendee list. The server recomputes `quantity` and `total_price` from the
 * attendees (regular 125000 / student 85000 / free 0). If a receipt screenshot
 * was provided it is uploaded to Supabase Storage, but it is optional.
 *
 * Without configuration the service falls back to DEMO MODE.
 */
const REFERENCE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const MAX_REFERENCE_ATTEMPTS = 3;
const UNIQUE_VIOLATION = '23505';
const RECEIPTS_BUCKET = 'receipts';

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

function fileExtension(name: string): string {
  const index = name.lastIndexOf('.');
  return index >= 0 ? name.slice(index).toLowerCase() : '.jpg';
}

export async function submitBooking(
  request: BookingRequest,
  receiptFile: File | null,
): Promise<BookingResult> {
  if (!isSupabaseConfigured || !supabase) {
    await delay(1200);
    return {
      reference: generateDemoReference(),
      status: 'demo',
      statusNote: 'نسخهٔ نمایشی — هیچ پرداختی انجام نشده و صندلی‌ای رزرو نشده است.',
    };
  }

  const attendees: AttendeeRow[] = request.attendees.map((a) => {
    const rate = classifyStudentCode(a.studentCode) ?? 'regular';
    return { ...a, rate, price: unitPrice(rate) };
  });

  const buyer = attendees[0];
  const row = {
    first_name: buyer.firstName,
    last_name: buyer.lastName,
    phone: request.phone,
    quantity: attendees.length,
    performance_id: request.performanceId,
    performance_date: request.performanceDateISO,
    showtime_id: request.showtimeId,
    showtime_time: request.showtimeTime,
    total_price: request.expectedTotal,
    attendees,
    status: 'paid',
    status_note: 'پرداخت ثبت شد — بلیت صادر شد.',
  };

  for (let attempt = 1; attempt <= MAX_REFERENCE_ATTEMPTS; attempt++) {
    const reference = generateReference();
    const { error } = await supabase
      .from('bookings')
      .insert({ reference, ...row });

    if (!error) {
      if (receiptFile) {
        const path = `${reference}${fileExtension(receiptFile.name)}`;
        await supabase.storage
          .from(RECEIPTS_BUCKET)
          .upload(path, receiptFile, {
            contentType: receiptFile.type || 'image/jpeg',
            upsert: false,
          });
        await supabase
          .from('bookings')
          .update({ receipt_path: path })
          .eq('reference', reference);
      }

      return {
        reference,
        status: 'confirmed',
        statusNote: 'پرداخت ثبت شد؛ بلیت شما صادر شد.',
      };
    }

    // Unique-constraint collision on the random ticket code — retry with a fresh one.
    if (error.code !== UNIQUE_VIOLATION) {
      throw new Error('ثبت سفارش ناموفق بود. لطفاً دوباره تلاش کنید.');
    }
  }

  throw new Error('ثبت سفارش ناموفق بود. لطفاً دوباره تلاش کنید.');
}

