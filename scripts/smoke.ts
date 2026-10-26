/**
 * Logic smoke test — run with: npx tsx scripts/smoke.ts
 * Not part of the app build; validates the pure booking logic.
 */
import { normalizeIranianMobile } from '../src/utils/phone';
import { unitPrice, totalPrice, pricing } from '../src/config/pricing';
import { performances, findPerformance } from '../src/data/performances';
import { validateBooking } from '../src/utils/validation';
import { formatPerformanceDate, formatCurrency } from '../src/utils/format';

let failures = 0;
function check(name: string, cond: boolean) {
  if (!cond) {
    failures++;
    console.error(`✗ ${name}`);
  } else {
    console.log(`✓ ${name}`);
  }
}

// Phone normalization
check('plain 09 number', normalizeIranianMobile('09123456789') === '09123456789');
check('+98 prefix', normalizeIranianMobile('+989123456789') === '09123456789');
check('98 prefix', normalizeIranianMobile('989123456789') === '09123456789');
check('Persian digits', normalizeIranianMobile('۰۹۱۲۳۴۵۶۷۸۹') === '09123456789');
check('spaces & dashes', normalizeIranianMobile('0912 345-6789') === '09123456789');
check('reject landline prefix', normalizeIranianMobile('02123456789') === null);
check('reject too short', normalizeIranianMobile('0912345') === null);
check('reject garbage', normalizeIranianMobile('hello') === null);

// Pricing
check('regular unit price', unitPrice(false) === pricing.regularTicketPrice);
check('student unit price', unitPrice(true) === pricing.studentTicketPrice);
check('total = qty × unit (regular)', totalPrice(3, false) === 3 * pricing.regularTicketPrice);
check('total = qty × unit (student)', totalPrice(2, true) === 2 * pricing.studentTicketPrice);

// Performances
check('performances generated', performances.length > 0);
const today = new Date();
today.setHours(0, 0, 0, 0);
check('no past performances', performances.every((p) => new Date(`${p.dateISO}T00:00:00`) >= today));
check('every performance has showtimes', performances.every((p) => p.showtimes.length > 0));
console.log('  first date (fa):', formatPerformanceDate(performances[0].dateISO));

// Validation — empty form
const empty = validateBooking({
  firstName: ' ',
  lastName: '',
  phone: '123',
  quantity: 0,
  performanceId: '',
  showtimeId: '',
  isStudent: false,
});
check('empty form: firstName error', Boolean(empty.errors.firstName));
check('empty form: lastName error', Boolean(empty.errors.lastName));
check('empty form: phone error', Boolean(empty.errors.phone));
check('empty form: quantity error', Boolean(empty.errors.quantity));
check('empty form: performance error', Boolean(empty.errors.performanceId));
check('empty form: no request', !empty.request);

// Validation — quantity cap
const overCap = validateBooking({
  firstName: 'آزما',
  lastName: 'آزمایشی',
  phone: '+98 912 345 6789',
  quantity: pricing.maxTicketsPerOrder + 1,
  performanceId: performances[0].id,
  showtimeId: performances[0].showtimes[0].id,
  isStudent: false,
});
check('over-cap quantity rejected', Boolean(overCap.errors.quantity));

// Validation — unknown / fake date rejected
const fakeDate = validateBooking({
  firstName: 'آزما',
  lastName: 'آزمایشی',
  phone: '09123456789',
  quantity: 1,
  performanceId: 'perf-1999-01-01',
  showtimeId: 'evening',
  isStudent: true,
});
check('unscheduled date rejected', Boolean(fakeDate.errors.performanceId));

// Validation — fully valid
const perf = performances[0];
const valid = validateBooking({
  firstName: ' آزما ',
  lastName: ' آزمایشی ',
  phone: '+989123456789',
  quantity: 2,
  performanceId: perf.id,
  showtimeId: perf.showtimes[1].id,
  isStudent: true,
});
check('valid form passes', Boolean(valid.request));
check('names trimmed', valid.request?.firstName === 'آزما' && valid.request?.lastName === 'آزمایشی');
check('phone normalized in request', valid.request?.phone === '09123456789');
check(
  'expectedTotal uses student price',
  valid.request?.expectedTotal === 2 * pricing.studentTicketPrice,
);

// Formatting
check('currency formatting', formatCurrency(350000, 'تومان') === '۳۵۰٬۰۰۰ تومان');
check('findPerformance roundtrip', findPerformance(perf.id)?.dateISO === perf.dateISO);

if (failures > 0) {
  console.error(`\n${failures} check(s) FAILED`);
  process.exit(1);
}
console.log('\nAll checks passed.');
