import { useCallback, useEffect, useRef, useState } from 'react';
import { performances } from '../data/performances';
import { totalPrice, unitPrice } from '../config/pricing';
import type { BookingFormValues, BookingResult, TicketData } from '../types';
import { submitBooking } from '../services/bookingService';
import { BookingForm } from './BookingForm';
import { OrderSummary } from './OrderSummary';
import { GeneratedTicket } from './GeneratedTicket';
import { Reveal } from './Reveal';

const DEFAULT_FORM: BookingFormValues = {
  firstName: '',
  lastName: '',
  phone: '',
  quantity: 2,
  performanceId: performances[0]?.id ?? '',
  showtimeId: performances[0]?.showtimes[0]?.id ?? '',
  studentCode: '',
};

export function BookingSection() {
  const [form, setForm] = useState<BookingFormValues>(DEFAULT_FORM);
  const [result, setResult] = useState<BookingResult | null>(null);
  const ticketRef = useRef<HTMLDivElement>(null);

  const update = useCallback((patch: Partial<BookingFormValues>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setResult(null);
  }, []);

  const performance =
    performances.find((p) => p.id === form.performanceId) ?? performances[0];
  const showtime = performance?.showtimes.find((s) => s.id === form.showtimeId);
  const isStudent = form.studentCode.trim().length > 0;

  useEffect(() => {
    if (result && ticketRef.current) {
      ticketRef.current.focus();
    }
  }, [result]);

  const ticket: TicketData | null = result
    ? {
        reference: result.reference,
        status: result.status,
        statusNote: result.statusNote,
        buyerFullName: `${form.firstName} ${form.lastName}`.trim(),
        quantity: form.quantity,
        isStudent,
        performanceDateISO: performance?.dateISO ?? '',
        showtime: showtime?.time ?? '',
        unitPrice: unitPrice(isStudent),
        totalPrice: totalPrice(form.quantity, isStudent),
        issuedAtISO: new Date().toISOString(),
      }
    : null;

  return (
    <section
      id="booking"
      className="section print:py-0"
      aria-labelledby="booking-title"
    >
      <div className="container">
        <Reveal className="print:hidden">
          <p className="section-kicker">رزرو بلیت</p>
          <h2 id="booking-title" className="section-title">
            صندلی خود را انتخاب کنید
          </h2>
          <p className="section-lead">
            مبلغ را کارت به کارت واریز و تصویر رسید را بارگذاری کنید؛ بلیت شما پس از
            تأیید پرداخت توسط مدیریت صادر می‌شود.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 items-start gap-[clamp(2rem,5vw,4rem)] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div>
            <Reveal className="print:hidden">
              <BookingForm
                form={form}
                onChange={update}
                onSubmit={async (request, receiptFile) => {
                  const res = await submitBooking(request, receiptFile);
                  setResult(res);
                }}
              />
            </Reveal>

            {result && result.status === 'demo' && ticket && (
              <div
                ref={ticketRef}
                tabIndex={-1}
                className="mt-12 outline-none"
                aria-live="polite"
              >
                <GeneratedTicket
                  ticket={ticket}
                  onNewBooking={() => {
                    setResult(null);
                    setForm(DEFAULT_FORM);
                  }}
                />
              </div>
            )}

            {result && result.status === 'pending' && (
              <div
                ref={ticketRef}
                tabIndex={-1}
                className="mt-12 border border-line bg-surface p-8 text-center outline-none"
                aria-live="polite"
              >
                <p className="m-0 text-[0.8rem] tracking-[0.3em] text-gold">سفارش ثبت شد</p>
                <h3 className="m-0 mt-2 text-xl font-extrabold">در انتظار تأیید پرداخت</h3>
                <p className="mt-3 text-[0.95rem] text-ink-muted">
                  کد پیگیری:{' '}
                  <span dir="ltr" className="font-mono font-bold text-ink">
                    {result.reference}
                  </span>
                </p>
                <p className="mx-auto mt-2 max-w-[44ch] text-[0.9rem] text-ink-muted">
                  {result.statusNote}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setForm(DEFAULT_FORM);
                  }}
                  className="btn btn-ghost mt-6"
                >
                  رزرو جدید
                </button>
              </div>
            )}
          </div>

          <Reveal delay={140} className="print:hidden">
            <OrderSummary form={form} performance={performance} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
