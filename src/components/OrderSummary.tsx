import { theater } from '../config/theater';
import { pricing, unitPrice } from '../config/pricing';
import { payment } from '../config/payment';
import { classifyStudentCode, rateLabel } from '../utils/studentCode';
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
  const total = form.attendees.reduce(
    (sum, a) => sum + unitPrice(classifyStudentCode(a.studentCode) ?? 'regular'),
    0,
  );

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

        <div className="border-b border-line py-[0.8rem]">
          <p className="m-0 mb-[0.4rem] text-[0.78rem] text-ink-muted">بلیت‌ها</p>
          <ul className="m-0 list-none space-y-[0.35rem] p-0">
            {form.attendees.map((a, i) => {
              const rate = classifyStudentCode(a.studentCode) ?? 'regular';
              return (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 text-[0.85rem]"
                >
                  <span className="min-w-0 truncate">
                    {toPersianDigits(i + 1)}. {a.firstName || '—'} {a.lastName}
                  </span>
                  <span className="shrink-0 text-ink-muted">
                    {rateLabel(rate)} · {formatCurrency(unitPrice(rate), pricing.currency)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex justify-between gap-4 py-[1rem] text-[1.05rem] font-bold">
          <dt>جمع کل</dt>
          <dd className="m-0 text-end text-gold">{formatCurrency(total, pricing.currency)}</dd>
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
        حداکثر {toPersianDigits(pricing.maxTicketsPerOrder)} بلیت در هر سفارش؛ مبلغ نهایی هنگام
        رزرو نمایش داده می‌شود.
      </p>
    </aside>
  );
}
