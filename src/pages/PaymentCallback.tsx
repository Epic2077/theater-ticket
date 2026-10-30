import { useEffect, useState } from 'react';
import type { PaidBooking, TicketData } from '../types';
import { verifyZarinpalPayment } from '../services/paymentService';
import { GeneratedTicket } from '../components/GeneratedTicket';

type State =
  | { kind: 'loading' }
  | { kind: 'success'; ticket: TicketData; refId: string }
  | { kind: 'failed'; message: string };

function toTicket(booking: PaidBooking): TicketData {
  return {
    reference: booking.reference,
    status: 'confirmed',
    statusNote: 'پرداخت موفق — بلیت شما تأیید شده است.',
    buyerFullName: `${booking.first_name} ${booking.last_name}`.trim(),
    quantity: booking.quantity,
    isStudent: booking.is_student,
    performanceDateISO: booking.performance_date,
    showtime: booking.showtime_time,
    unitPrice: booking.unit_price,
    totalPrice: booking.total_price,
    issuedAtISO: booking.paid_at ?? new Date().toISOString(),
  };
}

export function PaymentCallback() {
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    // Zarinpal appends "?Authority=…&Status=OK" AFTER the hash.
    const [, queryString = ''] = window.location.hash.split('?');
    const params = new URLSearchParams(queryString);
    const authority = params.get('Authority');
    const status = params.get('Status');

    if (!authority || status !== 'OK') {
      setState({ kind: 'failed', message: 'پرداخت ناموفق بود یا توسط شما لغو شد.' });
      return;
    }

    let alive = true;
    verifyZarinpalPayment(authority)
      .then(({ refId, booking }) => {
        if (alive) setState({ kind: 'success', ticket: toTicket(booking), refId });
      })
      .catch((error: Error) => {
        if (alive) setState({ kind: 'failed', message: error.message });
      });

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="container py-16">
      {state.kind === 'loading' && (
        <p className="text-center text-ink-muted">در حال تأیید پرداخت…</p>
      )}

      {state.kind === 'failed' && (
        <div className="mx-auto max-w-xl border border-line bg-surface p-8 text-center">
          <p className="m-0 text-[0.8rem] tracking-[0.3em] text-gold">خطا در پرداخت</p>
          <h1 className="m-0 mt-2 text-2xl font-extrabold">پرداخت ناموفق بود</h1>
          <p className="mt-3 text-ink-muted">{state.message}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href="#booking" className="btn btn-primary">تلاش مجدد</a>
            <a href="#/" className="btn btn-ghost">بازگشت به سایت</a>
          </div>
        </div>
      )}

      {state.kind === 'success' && (
        <>
          <header className="mx-auto max-w-xl text-center">
            <p className="m-0 text-[0.8rem] tracking-[0.3em] text-gold">پرداخت موفق</p>
            <h1 className="m-0 mt-2 text-2xl font-extrabold">بلیت شما صادر شد</h1>
            <p className="m-0 mt-2 text-ink-muted">
              کد پیگیری زرین‌پال:{' '}
              <span dir="ltr" className="font-mono">{state.refId}</span>
            </p>
          </header>
          <div className="mx-auto mt-8 max-w-2xl">
            <GeneratedTicket
              ticket={state.ticket}
              onNewBooking={() => {
                window.location.hash = '#/booking';
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}