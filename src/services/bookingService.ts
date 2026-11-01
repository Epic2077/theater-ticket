import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { unitPrice } from '../config/pricing';
import { classifyStudentCode } from '../utils/studentCode';
import { receiptFileError, receiptFileExtension } from '../config/receipts';
import type { AttendeeRow, BookingRequest, BookingResult } from '../types';

/**
 * Booking service — the ONLY place the UI talks to for submissions.
 *
 * When Supabase is configured, a booking is INSERTed as `paid` with the full
 * attendee list. The server recomputes `quantity` and `total_price` from the
 * attendees (regular 125000 / student 85000 / free 0). A receipt screenshot
 * is uploaded before the booking is inserted and stored with the booking.
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

export async function submitBooking(
  request: BookingRequest,
  receiptFile: File | null,
): Promise<BookingResult> {
  const receiptError = receiptFileError(receiptFile);
  if (receiptError) throw new Error(receiptError);
  if (!receiptFile) throw new Error('تصویر رسید الزامی است.');

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
    status_note: 'رسید ثبت شد — بلیت صادر شد.',
  };

  for (let attempt = 1; attempt <= MAX_REFERENCE_ATTEMPTS; attempt++) {
    const reference = generateReference();
    const receiptPath = `${reference}${receiptFileExtension(receiptFile)}`;
    const { error: uploadError } = await supabase.storage
      .from(RECEIPTS_BUCKET)
      .upload(receiptPath, receiptFile, {
        contentType: receiptFile.type,
        upsert: false,
      });

    if (uploadError) {
      if (
        uploadError.message.toLowerCase().includes('size') ||
        uploadError.message.toLowerCase().includes('payload')
      ) {
        throw new Error('حجم تصویر رسید بیش از حد مجاز است.');
      }
      throw new Error(
        'بارگذاری تصویر رسید ناموفق بود. لطفاً دوباره تلاش کنید؛ اگر دوباره تکرار شد، با پشتیبانی به شمارهٔ ۰۹۳۳۸۴۸۴۷۹۶ تماس بگیرید.',
      );
    }

    const { error } = await supabase
      .from('bookings')
      .insert({ reference, ...row, receipt_path: receiptPath });

    if (!error) {
      return {
        reference,
        status: 'confirmed',
        statusNote: 'رسید ثبت شد؛ بلیت شما صادر شد.',
      };
    }

    await supabase.storage.from(RECEIPTS_BUCKET).remove([receiptPath]);

    // Unique-constraint collision on the random ticket code — retry with a fresh one.
    if (error.code !== UNIQUE_VIOLATION) {
      throw new Error('ثبت سفارش ناموفق بود. لطفاً دوباره تلاش کنید.');
    }
  }

  throw new Error('ثبت سفارش ناموفق بود. لطفاً دوباره تلاش کنید.');
}
