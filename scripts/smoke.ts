/**
 * Logic smoke test — run with: npx tsx scripts/smoke.ts
 * Not part of the app build; validates the pure booking logic.
 */
import { normalizeIranianMobile } from '../src/utils/phone';
import { unitPrice, totalPriceFor, pricing } from '../src/config/pricing';
import { performances, findPerformance } from '../src/data/performances';
import { validateBooking } from '../src/utils/validation';
import { classifyStudentCode } from '../src/utils/studentCode';
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

// Student-code classification
check('empty code → regular', classifyStudentCode('') === 'regular');
check('free code → free', classifyStudentCode('919392077') === 'free');
check('39000000 → student', classifyStudentCode('39000000') === 'student');
check('40499999 → student', classifyStudentCode('40499999') === 'student');
check('40500000 → invalid', classifyStudentCode('40500000') === null);
check('38999999 → invalid', classifyStudentCode('38999999') === null);
check('short code → invalid', classifyStudentCode('3901234') === null);
check('letters → invalid', classifyStudentCode('abcdefgh') === null);

// Pricing
check('regular price', unitPrice('regular') === pricing.regularTicketPrice);
check('student price', unitPrice('student') === pricing.studentTicketPrice);
check('free price', unitPrice('free') === pricing.freeTicketPrice);
check('prices set correctly', pricing.regularTicketPrice === 125000 && pricing.studentTicketPrice === 85000);
check(
  'total sums rates',
  totalPriceFor(['regular', 'student', 'free']) === 125000 + 85000 + 0,
);

// Performances
check('performances generated', performances.length > 0);
const today = new Date();
today.setHours(0, 0, 0, 0);
check('no past performances', performances.every((p) => new Date(`${p.dateISO}T00:00:00`) >= today));
check('every performance has showtimes', performances.every((p) => p.showtimes.length > 0));
console.log('  first date (fa):', formatPerformanceDate(performances[0].dateISO));

// Validation — empty form
const empty = validateBooking({
  phone: '123',
  quantity: 0,
  performanceId: '',
  showtimeId: '',
  attendees: [{ firstName: ' ', lastName: '', studentCode: '' }],
});
check('empty form: phone error', Boolean(empty.errors.phone));
check('empty form: quantity error', Boolean(empty.errors.quantity));
check('empty form: performance error', Boolean(empty.errors.performanceId));
check('empty form: firstName error', Boolean(empty.errors.attendees?.[0]?.firstName));
check('empty form: lastName error', Boolean(empty.errors.attendees?.[0]?.lastName));
check('empty form: no request', !empty.request);

// Validation — quantity cap
const overCap = validateBooking({
  phone: '+98 912 345 6789',
  quantity: pricing.maxTicketsPerOrder + 1,
  performanceId: performances[0].id,
  showtimeId: performances[0].showtimes[0].id,
  attendees: [{ firstName: 'آزما', lastName: 'آزمایشی', studentCode: '' }],
});
check('over-cap quantity rejected', Boolean(overCap.errors.quantity));

// Validation — unknown / fake date rejected
const fakeDate = validateBooking({
  phone: '09123456789',
  quantity: 1,
  performanceId: 'perf-1999-01-01',
  showtimeId: 'evening',
  attendees: [{ firstName: 'آزما', lastName: 'آزمایشی', studentCode: '' }],
});
check('unscheduled date rejected', Boolean(fakeDate.errors.performanceId));

// Validation — valid, mixed rates
const perf = performances[0];
const valid = validateBooking({
  phone: '+989123456789',
  quantity: 3,
  performanceId: perf.id,
  showtimeId: perf.showtimes[0].id,
  attendees: [
    { firstName: ' آزما ', lastName: ' آزمایشی ', studentCode: '' },
    { firstName: 'دانشجو', lastName: 'دانش', studentCode: ' ۳۹۰۱۲۳۴۵ ' },
    { firstName: 'رایگان', lastName: 'رایگان', studentCode: '919392077' },
  ],
});
check('valid form passes', Boolean(valid.request));
check('names trimmed', valid.request?.attendees[0].firstName === 'آزما');
check('phone normalized in request', valid.request?.phone === '09123456789');
check('student code normalized', valid.request?.attendees[1].studentCode === '39012345');
check(
  'total = regular + student + free',
  valid.request?.expectedTotal === 125000 + 85000 + 0,
);

// Validation — invalid student code rejected
const bad = validateBooking({
  phone: '09123456789',
  quantity: 1,
  performanceId: perf.id,
  showtimeId: perf.showtimes[0].id,
  attendees: [{ firstName: 'آزما', lastName: 'آزمایشی', studentCode: '12345' }],
});
check('invalid student code rejected', Boolean(bad.errors.attendees?.[0]?.studentCode));

// Formatting
check('currency formatting', formatCurrency(125000, 'تومان') === '۱۲۵٬۰۰۰ تومان');
check('findPerformance roundtrip', findPerformance(perf.id)?.dateISO === perf.dateISO);

if (failures > 0) {
  console.error(`\n${failures} check(s) FAILED`);
  process.exit(1);
}
console.log('\nAll checks passed.');
