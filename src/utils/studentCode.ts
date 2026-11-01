import { pricing } from '../config/pricing';
import type { TicketRate } from '../types';

/** Normalize Persian/Arabic digits and strip spaces/dashes. */
export function normalizeStudentCode(raw: string): string {
  return raw
    .trim()
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[\s-]/g, '');
}

/**
 * Classify a student code.
 *   ''            → 'regular'
 *   '919392077'   → 'free'
 *   '390xxxxx'…   → 'student'
 *   anything else → null (invalid)
 */
export function classifyStudentCode(raw: string): TicketRate | null {
  const code = normalizeStudentCode(raw);
  if (!code) return 'regular';
  if (code === pricing.freeCode) return 'free';
  if (pricing.studentCodePattern.test(code)) return 'student';
  return null;
}

/** Persian label for a ticket rate. */
export function rateLabel(rate: TicketRate): string {
  if (rate === 'student') return 'دانشجویی';
  if (rate === 'free') return 'رایگان';
  return 'عادی';
}