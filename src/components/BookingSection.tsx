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
  isStudent: false,
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
        isStudent: form.isStudent,
        performanceDateISO: performance?.dateISO ?? '',
        showtime: showtime?.time ?? '',
        unitPrice: unitPrice(form.isStudent),
        totalPrice: totalPrice(form.quantity, form.isStudent),
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
            پس از تکمیل فرم، بلیت شما بلافاصله با کد رهگیری و QR صادر می‌شود و
            می‌توانید همان لحظه آن را چاپ یا ذخیره کنید.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 items-start gap-[clamp(2rem,5vw,4rem)] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div>
            <Reveal className="print:hidden">
              <BookingForm
                form={form}
                onChange={update}
                onSubmit={async (request) => {
                  setResult(await submitBooking(request));
                }}
              />
            </Reveal>

            {result && ticket && (
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
          </div>

          <Reveal delay={140} className="print:hidden">
            <OrderSummary form={form} performance={performance} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
