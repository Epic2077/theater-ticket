import { theater } from '../config/theater';
import { pricing, totalPrice, unitPrice } from '../config/pricing';
import {
  formatCurrency,
  formatPerformanceDate,
  formatTime,
  toPersianDigits,
} from '../utils/format';
import type { BookingFormValues, Performance } from '../types';

interface OrderSummaryProps {
  form: BookingFormValues;
  performance?: Performance;
}

export function OrderSummary({ form, performance }: OrderSummaryProps) {
  const showtime = performance?.showtimes.find((s) => s.id === form.showtimeId);
  const unit = unitPrice(form.isStudent);
  const total = totalPrice(form.quantity, form.isStudent);

  const rows = [
    { label: 'نمایش', value: theater.productionTitle },
    {
      label: 'تاریخ',
      value: performance ? formatPerformanceDate(performance.dateISO) : '—',
    },
    {
      label: 'سانس',
      value: showtime
        ? `${showtime.label ?? ''} ${formatTime(showtime.time)}`.trim()
        : '—',
    },
    { label: 'تعداد بلیت', value: `${toPersianDigits(form.quantity)} عدد` },
    { label: 'نوع بلیت', value: form.isStudent ? 'دانشجویی' : 'عادی' },
    { label: 'قیمت واحد', value: formatCurrency(unit, pricing.currency) },
  ];

  return (
    <aside className="border border-line bg-surface">
      <header className="border-b border-line px-[1.6rem] py-[1.1rem]">
        <h3 className="m-0 text-[1rem] font-bold">خلاصهٔ سفارش</h3>
      </header>

      <dl className="m-0 px-[1.6rem] py-[0.6rem]">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex justify-between gap-4 border-b border-line py-[0.8rem] text-[0.9rem]"
          >
            <dt className="text-ink-muted">{row.label}</dt>
            <dd className="m-0 text-end">{row.value}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-4 py-[1rem] text-[1.05rem] font-bold">
          <dt>جمع کل</dt>
          <dd className="m-0 text-end text-gold">
            {formatCurrency(total, pricing.currency)}
          </dd>
        </div>
      </dl>

      <p className="m-0 border-t border-line px-[1.6rem] py-[1rem] text-[0.78rem] leading-[1.9] text-ink-muted">
        حداکثر {toPersianDigits(pricing.maxTicketsPerOrder)} بلیت در هر سفارش؛
        مبلغ نهایی هنگام رزرو نمایش داده می‌شود.
      </p>
    </aside>
  );
}
