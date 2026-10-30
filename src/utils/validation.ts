import type {
  BookingErrors,
  BookingFormValues,
  BookingRequest,
  Performance,
  Showtime,
} from '../types';
import { pricing, totalPrice } from '../config/pricing';
import { findPerformance, findShowtime } from '../data/performances';
import { normalizeIranianMobile } from './phone';

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

/** Accepts letters/digits (incl. Persian/Arabic digits) after normalization. */
const STUDENT_CODE_PATTERN = /^[A-Za-z0-9]{4,30}$/;

function normalizeStudentCode(raw: string): string {
  return raw
    .trim()
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[\s-]/g, '');
}

/** Centralized client-side validation. The server MUST re-validate everything. */
export function validateBooking(values: BookingFormValues): ValidationResult {
  const errors: BookingErrors = {};

  const firstName = values.firstName.trim();
  const lastName = values.lastName.trim();
  if (!firstName) errors.firstName = 'لطفاً نام خود را وارد کنید.';
  if (!lastName) errors.lastName = 'لطفاً نام خانوادگی خود را وارد کنید.';

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

  const studentCode = normalizeStudentCode(values.studentCode);
  const isStudent = studentCode.length > 0;
  if (isStudent && !STUDENT_CODE_PATTERN.test(studentCode)) {
    errors.studentCode = 'کد دانشجویی نامعتبر است.';
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

  if (Object.keys(errors).length > 0 || !performance) return { errors };

  return {
    errors,
    request: {
      firstName,
      lastName,
      phone: phone!,
      quantity: values.quantity,
      performanceId: values.performanceId,
      showtimeId: values.showtimeId,
      performanceDateISO: performance.dateISO,
      showtimeTime: showtime?.time ?? '',
      studentCode: isStudent ? studentCode : '',
      isStudent,
      expectedTotal: totalPrice(values.quantity, isStudent),
    },
  };
}
