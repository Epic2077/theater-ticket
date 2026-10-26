import { useEffect, useState } from 'react';
import { toDataURL } from 'qrcode';
import { theater } from '../config/theater';
import { pricing } from '../config/pricing';
import {
  formatCurrency,
  formatGregorianDate,
  formatPerformanceDate,
  formatTime,
  toPersianDigits,
} from '../utils/format';
import type { TicketData } from '../types';
import { ArtImage } from './ArtImage';

interface GeneratedTicketProps {
  ticket: TicketData;
  onNewBooking: () => void;
}

export function GeneratedTicket({
  ticket,
  onNewBooking,
}: GeneratedTicketProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const qrPayload = JSON.stringify({
    ref: ticket.reference,
    name: ticket.buyerFullName,
    date: ticket.performanceDateISO,
    time: ticket.showtime,
    qty: ticket.quantity,
  });

  useEffect(() => {
    let alive = true;
    toDataURL(qrPayload, {
      margin: 1,
      width: 240,
      color: { dark: '#101010', light: '#ffffff' },
    })
      .then((url) => {
        if (alive) setQrDataUrl(url);
      })
      .catch(() => {
        if (alive) setQrDataUrl(null);
      });
    return () => {
      alive = false;
    };
  }, [qrPayload]);

  const isDemo = ticket.status === 'demo';

  return (
    <article className="animate-ticket-in border border-line bg-surface text-ink print:border-black print:bg-white print:text-black">
      <div className="grid grid-cols-1 sm:grid-cols-[10rem_1fr]">
        <div className="relative border-b border-line p-4 sm:border-b-0 sm:border-e print:border-b-black sm:print:border-e-black">
          <ArtImage
            src="/images/poster.jpg"
            alt={`پوستر نمایش ${theater.productionTitle}`}
            fallbackLabel={theater.productionTitle}
            compact
            className="aspect-[3/4] w-full border border-line object-cover print:border-black"
          />
          <span className="mt-3 block text-center text-[0.72rem] tracking-[0.2em] text-ink-muted print:text-black">
            {theater.venue.name}
          </span>
        </div>

        <div className="flex flex-col gap-[1rem] p-[1.6rem]">
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="m-0 text-[0.72rem] tracking-[0.28em] text-gold">
                {theater.groupName}
              </p>
              <h3 className="m-0 mt-1 font-display text-[1.4rem] font-extrabold">
                {theater.productionTitle}
              </h3>
            </div>
            <span
              className={`inline-flex items-center gap-2 border px-[0.8rem] py-[0.35rem] text-[0.75rem] ${
                isDemo
                  ? 'border-gold text-gold'
                  : 'border-line-strong text-ink-muted'
              }`}
            >
              <span
                className={`size-2 rounded-full ${isDemo ? 'bg-gold' : 'bg-ink-muted'}`}
                aria-hidden="true"
              />
              {isDemo ? 'نسخهٔ نمایشی' : 'رزرو تأییدشده'}
            </span>
          </header>

          <dl className="m-0 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
            <div className="flex justify-between gap-3 border-b border-line py-[0.6rem] text-[0.9rem] print:border-black">
              <dt className="text-ink-muted print:text-black">خریدار</dt>
              <dd className="m-0 text-end">{ticket.buyerFullName}</dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-line py-[0.6rem] text-[0.9rem] print:border-black">
              <dt className="text-ink-muted print:text-black">تاریخ</dt>
              <dd className="m-0 text-end">
                {formatPerformanceDate(ticket.performanceDateISO)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-line py-[0.6rem] text-[0.9rem] print:border-black">
              <dt className="text-ink-muted print:text-black">سانس</dt>
              <dd className="m-0 text-end">{formatTime(ticket.showtime)}</dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-line py-[0.6rem] text-[0.9rem] print:border-black">
              <dt className="text-ink-muted print:text-black">تعداد / نوع</dt>
              <dd className="m-0 text-end">
                {toPersianDigits(ticket.quantity)} عدد ·{' '}
                {ticket.isStudent ? 'دانشجویی' : 'عادی'}
              </dd>
            </div>
          </dl>

          <div className="mt-1 flex items-end justify-between gap-4">
            <div>
              <p className="m-0 text-[0.75rem] text-ink-muted print:text-black">
                مبلغ پرداختی
              </p>
              <p className="m-0 font-display text-[1.5rem] font-black text-gold">
                {formatCurrency(ticket.totalPrice, pricing.currency)}
              </p>
            </div>
            <div className="text-end">
              <p className="m-0 text-[0.75rem] text-ink-muted print:text-black">
                کد رهگیری
              </p>
              <p
                className="m-0 font-mono text-[0.95rem] font-bold tracking-[0.08em]"
                dir="ltr"
              >
                {ticket.reference}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 border-t border-line px-[1.6rem] py-[1.4rem] sm:flex-row sm:justify-between print:border-black">
        <div className="text-center sm:text-start">
          <p className="m-0 text-[0.72rem] text-ink-muted print:text-black">
            تاریخ میلادی: {formatGregorianDate(ticket.performanceDateISO)}
          </p>
          <p className="m-0 mt-1 text-[0.72rem] text-ink-muted print:text-black">
            صادر شده:{' '}
            {new Date(ticket.issuedAtISO).toLocaleDateString('fa-IR')}
          </p>
          <p className="m-0 mt-2 max-w-[40ch] text-[0.78rem] text-demo-ink">
            {ticket.statusNote}
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`کد QR بلیت ${ticket.reference}`}
              className="size-[7.5rem] border border-line bg-white p-1 print:border-black"
            />
          ) : (
            <div className="grid size-[7.5rem] place-items-center border border-line text-[0.72rem] text-ink-muted print:border-black">
              در حال ساخت QR…
            </div>
          )}
          <span
            className="font-mono text-[0.7rem] tracking-[0.15em] text-ink-muted print:text-black"
            dir="ltr"
          >
            {ticket.reference}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-line p-[1.2rem] print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="btn btn-primary"
        >
          چاپ بلیت
        </button>
        <button type="button" onClick={onNewBooking} className="btn btn-ghost">
          رزرو جدید
        </button>
      </div>
    </article>
  );
}
