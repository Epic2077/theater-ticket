import { useCallback, useEffect, useRef, useState } from 'react';
import { performances } from '../data/performances';
import { unitPrice } from '../config/pricing';
import { classifyStudentCode } from '../utils/studentCode';
import { toPersianDigits } from '../utils/format';
import type {
  AttendeeRow,
  BookingFormValues,
  BookingRequest,
  BookingResult,
  TicketData,
} from '../types';
import { submitBooking } from '../services/bookingService';
import { BookingForm } from './BookingForm';
import { OrderSummary } from './OrderSummary';
import { GeneratedTicket } from './GeneratedTicket';
import { Reveal } from './Reveal';

const DEFAULT_FORM: BookingFormValues = {
  phone: '',
  quantity: 1,
  performanceId: performances[0]?.id ?? '',
  showtimeId: performances[0]?.showtimes[0]?.id ?? '',
  attendees: [{ firstName: '', lastName: '', studentCode: '' }],
};

export function BookingSection() {
  const [form, setForm] = useState<BookingFormValues>(DEFAULT_FORM);
  const [result, setResult] = useState<BookingResult | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const ticketRef = useRef<HTMLDivElement>(null);

  const reset = useCallback(() => {
    setResult(null);
    setForm(DEFAULT_FORM);
    setCountdown(null);
  }, []);

  const update = useCallback((patch: Partial<BookingFormValues>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setResult(null);
    setCountdown(null);
  }, []);

  const performance =
    performances.find((p) => p.id === form.performanceId) ?? performances[0];
  const showtime = performance?.showtimes.find((s) => s.id === form.showtimeId);

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    if (countdown === 0 && ticketRef.current) ticketRef.current.focus();
  }, [countdown]);

  const handleSubmit = async (request: BookingRequest, receiptFile: File | null) => {
    const res = await submitBooking(request, receiptFile);
    setResult(res);
    setCountdown(5);
  };

  const attendees: AttendeeRow[] = form.attendees.map((a) => {
    const rate = classifyStudentCode(a.studentCode) ?? 'regular';
    return {
      firstName: a.firstName,
      lastName: a.lastName,
      studentCode: a.studentCode,
      rate,
      price: unitPrice(rate),
    };
  });

  const ticket: TicketData | null = result
    ? {
        reference: result.reference,
        status: result.status,
        statusNote: result.statusNote,
        buyerFullName: `${form.attendees[0]?.firstName ?? ''} ${form.attendees[0]?.lastName ?? ''}`.trim(),
        quantity: form.quantity,
        totalPrice: attendees.reduce((sum, a) => sum + a.price, 0),
        attendees,
        performanceDateISO: performance?.dateISO ?? '',
        showtime: showtime?.time ?? '',
        issuedAtISO: new Date().toISOString(),
      }
    : null;

  return (
    <section id="booking" className="section print:py-0" aria-labelledby="booking-title">
      <div className="container">
        {result === null && (
          <Reveal className="print:hidden">
            <p className="section-kicker">رزرو بلیت</p>
            <h2 id="booking-title" className="section-title">
              صندلی خود را انتخاب کنید
            </h2>
            <p className="section-lead">
              مبلغ را کارت به کارت واریز و تصویر رسید را بارگذاری کنید؛ بلیت شما بلافاصله
              صادر می‌شود.
            </p>
          </Reveal>
        )}

        {result === null ? (
          <div className="grid grid-cols-1 items-start gap-[clamp(2rem,5vw,4rem)] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <div>
              <Reveal className="print:hidden">
                <BookingForm form={form} onChange={update} onSubmit={handleSubmit} />
              </Reveal>
            </div>
            <Reveal delay={140} className="print:hidden">
              <OrderSummary form={form} performance={performance} />
            </Reveal>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl">
            {countdown !== null && countdown > 0 && (
              <div className="border border-line bg-surface p-10 text-center" aria-live="polite">
                <p className="m-0 text-[0.8rem] tracking-[0.3em] text-gold">رزرو کامل شد</p>
                <h3 className="m-0 mt-2 text-xl font-extrabold">رزرو شما با موفقیت ثبت شد</h3>
                <p className="mt-3 text-[0.95rem] text-ink-muted">
                  کد پیگیری:{' '}
                  <span dir="ltr" className="font-mono font-bold text-ink">
                    {result.reference}
                  </span>
                </p>
                <p className="m-0 mt-2 text-[0.9rem] text-ink-muted">{result.statusNote}</p>
                <p className="m-0 mt-5 text-ink-muted">در حال صدور بلیت…</p>
                <p className="m-0 mt-2 font-display text-[3rem] font-black text-gold">
                  {toPersianDigits(countdown)}
                </p>
              </div>
            )}

            {countdown === 0 && result && ticket && (
              <div ref={ticketRef} tabIndex={-1} className="outline-none" aria-live="polite">
                <GeneratedTicket ticket={ticket} onNewBooking={reset} />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
