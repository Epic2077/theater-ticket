/**
 * Iranian mobile-number normalization & validation.
 * Accepts: 09xxxxxxxxx, +989xxxxxxxxx, 00989xxxxxxxxx, 989xxxxxxxxx,
 * with Persian/Arabic digits, spaces or dashes.
 * Returns the normalized "09xxxxxxxxx" form, or null when invalid.
 */
export function normalizeIranianMobile(raw: string): string | null {
  let v = raw
    .trim()
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[\s\-()‌]/g, '');

  if (v.startsWith('+98')) v = `0${v.slice(3)}`;
  else if (v.startsWith('0098')) v = `0${v.slice(4)}`;
  else if (v.startsWith('98')) v = `0${v.slice(2)}`;

  return /^09\d{9}$/.test(v) ? v : null;
}
