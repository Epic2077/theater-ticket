import { theater } from '../config/theater';
import { pricing, totalPrice, unitPrice } from '../config/pricing';
import { payment } from '../config/payment';
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
  const isStudent = form.studentCode.trim().length > 0;
  const unit = unitPrice(isStudent);
  const total = totalPrice(form.quantity, isStudent);

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
    { label: 'نوع بلیت', value: isStudent ? 'دانشجویی' : 'عادی' },
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

      <div className="border-t border-line px-[1.6rem] py-[1.2rem]">
        <p className="m-0 text-[0.8rem] font-bold tracking-[0.15em] text-gold">
          پرداخت کارت به کارت
        </p>
        <p className="mt-2 text-[0.9rem] leading-[1.9] text-ink-muted">
          مبلغ را به کارت زیر واریز کنید و تصویر رسید را در فرم بارگذاری کنید.
        </p>
        <div className="mt-3 flex items-center justify-between gap-3 border border-line bg-surface-2 px-4 py-3">
          <span className="text-[0.85rem] text-ink-muted">شماره کارت</span>
          <span className="font-mono text-[0.95rem] font-bold tracking-[0.05em]" dir="ltr">
            {payment.cardNumber}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 border border-t-0 border-line bg-surface-2 px-4 py-3">
          <span className="text-[0.85rem] text-ink-muted">به نام</span>
          <span className="text-[0.9rem]">{payment.cardHolder}</span>
        </div>
        {payment.bankName && (
          <p className="m-0 mt-2 text-[0.78rem] text-ink-muted">بانک: {payment.bankName}</p>
        )}
      </div>

      <p className="m-0 border-t border-line px-[1.6rem] py-[1rem] text-[0.78rem] leading-[1.9] text-ink-muted">
        حداکثر {toPersianDigits(pricing.maxTicketsPerOrder)} بلیت در هر سفارش؛
        مبلغ نهایی هنگام رزرو نمایش داده می‌شود.
      </p>
    </aside>
  );
}
