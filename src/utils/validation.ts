import type {
  Attendee,
  AttendeeErrors,
  BookingErrors,
  BookingFormValues,
  BookingRequest,
  Performance,
  Showtime,
} from '../types';
import { pricing, unitPrice } from '../config/pricing';
import { findPerformance, findShowtime } from '../data/performances';
import { normalizeIranianMobile } from './phone';
import { classifyStudentCode, normalizeStudentCode } from './studentCode';
import { receiptFileError } from '../config/receipts';

export interface ValidationResult {
  errors: BookingErrors;
  /** Present only when validation passed. */
  request?: BookingRequest;
}

function isPastDate(dateISO: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${dateISO}T00:00:00`) < today;
}

/** Centralized client-side validation. The server re-validates everything. */
export function validateBooking(
  values: BookingFormValues,
  receiptFile: File | null = null,
): ValidationResult {
  const errors: BookingErrors = {};

  const phone = normalizeIranianMobile(values.phone);
  if (!values.phone.trim()) {
    errors.phone = 'وارد کردن شماره موبایل الزامی است.';
  } else if (!phone) {
    errors.phone = 'شماره موبایل معتبر نیست. نمونه: ۰۹۱۲۳۴۵۶۷۸۹';
  }

  if (!Number.isInteger(values.quantity) || values.quantity < 1) {
    errors.quantity = 'حداقل یک بلیت انتخاب کنید.';
  } else if (values.quantity > pricing.maxTicketsPerOrder) {
    errors.quantity = `حداکثر ${pricing.maxTicketsPerOrder} بلیت در هر سفارش مجاز است.`;
  }

  let performance: Performance | undefined;
  if (!values.performanceId) {
    errors.performanceId = 'لطفاً تاریخ اجرا را انتخاب کنید.';
  } else {
    performance = findPerformance(values.performanceId);
    if (!performance || isPastDate(performance.dateISO)) {
      errors.performanceId = 'تاریخ انتخاب‌شده معتبر نیست؛ لطفاً از فهرست اجراها انتخاب کنید.';
    }
  }

  let showtime: Showtime | undefined;
  if (performance && !errors.performanceId) {
    if (!values.showtimeId) {
      errors.showtimeId = 'لطفاً سانس موردنظر را انتخاب کنید.';
    } else {
      showtime = findShowtime(performance, values.showtimeId);
      if (!showtime) {
        errors.showtimeId = 'سانس انتخاب‌شده برای این تاریخ موجود نیست.';
      }
    }
  }

  const receiptError = receiptFileError(receiptFile);
  if (receiptError) errors.receipt = receiptError;

  // Attendees — one entry per ticket.
  const attendees: Attendee[] = [];
  const attendeeErrors: AttendeeErrors[] = [];
  let expectedTotal = 0;

  for (const raw of values.attendees) {
    const errs: AttendeeErrors = {};
    const firstName = raw.firstName.trim();
    const lastName = raw.lastName.trim();
    if (!firstName) errs.firstName = 'نام الزامی است.';
    if (!lastName) errs.lastName = 'نام خانوادگی الزامی است.';

    const rate = classifyStudentCode(raw.studentCode);
    if (rate === null) {
      errs.studentCode = 'کد دانشجویی نامعتبر است.';
    } else {
      expectedTotal += unitPrice(rate);
    }

    attendees.push({
      firstName,
      lastName,
      studentCode: normalizeStudentCode(raw.studentCode),
    });
    attendeeErrors.push(errs);
  }

  if (attendeeErrors.some((e) => Object.keys(e).length > 0)) {
    errors.attendees = attendeeErrors;
  }

  if (Object.keys(errors).length > 0 || !performance) return { errors };

  return {
    errors,
    request: {
      phone: phone!,
      quantity: values.quantity,
      performanceId: values.performanceId,
      showtimeId: values.showtimeId,
      performanceDateISO: performance.dateISO,
      showtimeTime: showtime?.time ?? '',
      attendees,
      expectedTotal,
    },
  };
}
