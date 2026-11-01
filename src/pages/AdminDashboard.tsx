import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { pricing } from '../config/pricing';
import { theater } from '../config/theater';
import { rateLabel } from '../utils/studentCode';
import type { BookingRecord, TicketRate } from '../types';
import {
  formatCurrency,
  formatPerformanceDate,
  formatTime,
  toPersianDigits,
} from '../utils/format';

const inputClass =
  'min-h-[3.2rem] w-full appearance-none rounded-none border border-line-strong bg-surface px-4 py-[0.8rem] font-body text-base text-ink transition-[border-color,background-color] duration-[250ms] ease-theater hover:border-ink-muted focus:border-gold focus:bg-surface-2 focus:outline-none';

/** Fold Persian/Arabic digits to Latin and lowercase, for search matching. */
function normalizeSearch(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .toLowerCase()
    .trim();
}

function bookingSearchText(booking: BookingRecord): string {
  const attendeesText = (booking.attendees ?? [])
    .map((a) => `${a.firstName} ${a.lastName} ${a.studentCode}`)
    .join(' ');
  return normalizeSearch(
    [
      booking.reference,
      booking.first_name,
      booking.last_name,
      `${booking.first_name} ${booking.last_name}`,
      booking.phone,
      attendeesText,
      booking.performance_date,
      booking.showtime_time,
    ].join(' '),
  );
}

type DashboardBooking = BookingRecord & { receipt_url?: string };

type CheckinRow = {
  key: string;
  firstName: string;
  lastName: string;
  reference: string;
  rate: TicketRate;
  studentCode: string;
  phone: string;
};

export function AdminDashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [bookings, setBookings] = useState<DashboardBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [nightFilter, setNightFilter] = useState('all');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const loadBookings = async () => {
    if (!supabase) return;
    const client = supabase;
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await client
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(`دریافت بلیت‌ها ناموفق بود: ${fetchError.message}`);
      setLoading(false);
      return;
    }

    const rows = (data as BookingRecord[]) ?? [];
    const withReceipts = await Promise.all(
      rows.map(async (b) => {
        if (!b.receipt_path) return b;
        const { data: signed } = await client.storage
          .from('receipts')
          .createSignedUrl(b.receipt_path, 60 * 60);
        return { ...b, receipt_url: signed?.signedUrl } as DashboardBooking;
      }),
    );
    setBookings(withReceipts);
    setLoading(false);
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setChecking(false);
      return;
    }

    let alive = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!alive) return;
        setSession(data.session);
        if (data.session) void loadBookings();
        setChecking(false);
      })
      .catch(() => {
        if (alive) setChecking(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next) void loadBookings();
      else setBookings([]);
    });

    return () => {
      alive = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setAuthLoading(true);
    setAuthError(null);
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (loginError) {
      setAuthError('ورود ناموفق بود؛ ایمیل یا رمز عبور را بررسی کنید.');
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setBookings([]);
  };

  const handleApprove = async (id: string) => {
    if (!supabase) return;
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', id);
    if (updateError) {
      setError(`تأیید پرداخت ناموفق بود: ${updateError.message}`);
      return;
    }
    await loadBookings();
  };

  const nights = useMemo(() => {
    const set = new Set(bookings.map((b) => b.performance_date));
    return Array.from(set).sort();
  }, [bookings]);

  const nightLabel =
    nightFilter === 'all' ? 'همهٔ شب‌ها' : formatPerformanceDate(nightFilter);

  const filtered = useMemo(() => {
    const base =
      nightFilter === 'all'
        ? bookings
        : bookings.filter((b) => b.performance_date === nightFilter);
    const query = normalizeSearch(search);
    if (!query) return base;
    return base.filter((b) => bookingSearchText(b).includes(query));
  }, [bookings, search, nightFilter]);

  const checkinRows = useMemo(() => {
    const rows: CheckinRow[] = [];
    for (const b of filtered) {
      for (const a of b.attendees ?? []) {
        rows.push({
          key: `${b.id}-${a.firstName}-${a.lastName}-${a.studentCode}`,
          firstName: a.firstName,
          lastName: a.lastName,
          reference: b.reference,
          rate: a.rate,
          studentCode: a.studentCode,
          phone: b.phone,
        });
      }
    }
    return rows;
  }, [filtered]);

  const paid = bookings.filter((b) => b.status === 'paid');
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const totalTickets = paid.reduce((sum, b) => sum + b.quantity, 0);
  const totalRevenue = paid.reduce((sum, b) => sum + b.total_price, 0);
  const studentTickets = paid.reduce(
    (sum, b) => sum + (b.attendees ?? []).filter((a) => a.rate === 'student').length,
    0,
  );

  const nightlySales = useMemo(() => {
    const byDate = new Map<
      string,
      { tickets: number; revenue: number; orders: number; times: Map<string, number> }
    >();
    for (const b of bookings) {
      if (b.status !== 'paid') continue;
      let entry = byDate.get(b.performance_date);
      if (!entry) {
        entry = { tickets: 0, revenue: 0, orders: 0, times: new Map() };
        byDate.set(b.performance_date, entry);
      }
      entry.tickets += b.quantity;
      entry.revenue += b.total_price;
      entry.orders += 1;
      entry.times.set(
        b.showtime_time,
        (entry.times.get(b.showtime_time) ?? 0) + b.quantity,
      );
    }
    return Array.from(byDate.entries())
      .map(([dateISO, entry]) => ({
        dateISO,
        totalTickets: entry.tickets,
        totalRevenue: entry.revenue,
        orders: entry.orders,
        showtimes: Array.from(entry.times.entries())
          .map(([time, tickets]) => ({ time, tickets }))
          .sort((a, b) => a.time.localeCompare(b.time)),
      }))
      .sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  }, [bookings]);

  if (!isSupabaseConfigured) {
    return (
      <div className="container py-20">
        <div className="mx-auto max-w-xl border border-line bg-surface p-8">
          <p className="m-0 text-[0.8rem] tracking-[0.3em] text-gold">داشبورد مدیریت</p>
          <h1 className="m-0 mt-2 text-2xl font-extrabold">{theater.productionTitle}</h1>
          <p className="mt-4 text-[0.92rem] leading-[2] text-ink-muted">
            برای اتصال به Supabase ابتدا فایل <code dir="ltr">.env</code> را با مقادیر{' '}
            <code dir="ltr">VITE_SUPABASE_URL</code> و{' '}
            <code dir="ltr">VITE_SUPABASE_ANON_KEY</code> پر کنید، سپس{' '}
            <code dir="ltr">npm run db:init</code> را اجرا کنید.
          </p>
          <a href="#/" className="btn btn-ghost mt-6">بازگشت به سایت</a>
        </div>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="container py-20 text-center text-ink-muted">در حال بارگذاری…</div>
    );
  }

  if (!session) {
    return (
      <div className="container flex min-h-[80vh] items-center justify-center py-16">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md border border-line bg-surface p-8"
        >
          <p className="m-0 text-[0.8rem] tracking-[0.3em] text-gold">ورود مدیر</p>
          <h1 className="m-0 mt-2 text-2xl font-extrabold">داشبورد مدیریت</h1>
          <p className="mt-3 text-[0.88rem] text-ink-muted">
            برای مشاهدهٔ بلیت‌های فروخته‌شده وارد شوید.
          </p>
          {authError && (
            <p role="alert" className="border border-accent bg-accent/15 px-4 py-2 text-[0.88rem]">
              {authError}
            </p>
          )}
          <div className="mt-6 flex flex-col gap-[1rem]">
            <div className="flex flex-col gap-[0.45rem]">
              <label htmlFor="admin-email" className="text-[0.88rem] font-medium">
                ایمیل
              </label>
              <input
                id="admin-email"
                type="email"
                dir="ltr"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputClass} text-left`}
              />
            </div>
            <div className="flex flex-col gap-[0.45rem]">
              <label htmlFor="admin-password" className="text-[0.88rem] font-medium">
                رمز عبور
              </label>
              <input
                id="admin-password"
                type="password"
                dir="ltr"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} text-left`}
              />
            </div>
            <button type="submit" disabled={authLoading} className="btn btn-primary btn-lg w-full">
              {authLoading ? 'در حال ورود…' : 'ورود'}
            </button>
            <a
              href="#/"
              className="text-center text-[0.82rem] text-ink-muted transition-colors hover:text-gold"
            >
              بازگشت به سایت
            </a>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="container py-10 print:py-0">
      <div className="print:hidden">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="m-0 text-[0.8rem] tracking-[0.3em] text-gold">داشبورد مدیریت</p>
          <h1 className="m-0 mt-1 text-2xl font-extrabold">بلیت‌های فروخته‌شده</h1>
          <p className="m-0 mt-1 text-[0.85rem] text-ink-muted">
            {theater.productionTitle} — {theater.venue.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a href="#/" className="btn btn-ghost btn-sm">بازگشت به سایت</a>
          <button type="button" onClick={handleLogout} className="btn btn-ghost btn-sm">
            خروج
          </button>
        </div>
      </header>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="تعداد بلیت‌ها" value={toPersianDigits(totalTickets)} />
        <Stat label="درآمد کل" value={formatCurrency(totalRevenue, pricing.currency)} />
        <Stat label="بلیت دانشجویی" value={toPersianDigits(studentTickets)} />
        <Stat label="در انتظار تأیید" value={toPersianDigits(pendingCount)} />
      </div>

      <section className="mt-10" aria-labelledby="nightly-title">
        <h2 id="nightly-title" className="m-0 text-[1.15rem] font-bold">
          فروش هر شب
        </h2>
        {nightlySales.length === 0 ? (
          <p className="mt-4 border border-line bg-surface p-6 text-center text-ink-muted">
            هنوز بلیتی فروخته نشده است.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {nightlySales.map((night) => (
              <div key={night.dateISO} className="border border-line bg-surface p-5">
                <p className="m-0 text-[0.78rem] text-ink-muted">تاریخ اجرا</p>
                <p className="m-0 mt-1 font-display text-[1.05rem] font-bold">
                  {formatPerformanceDate(night.dateISO)}
                </p>
                <dl className="m-0 mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[0.85rem]">
                  <div className="flex justify-between gap-2 border-b border-line pb-1">
                    <dt className="text-ink-muted">تعداد بلیت</dt>
                    <dd className="m-0 font-bold text-gold">
                      {toPersianDigits(night.totalTickets)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2 border-b border-line pb-1">
                    <dt className="text-ink-muted">سفارش</dt>
                    <dd className="m-0">{toPersianDigits(night.orders)}</dd>
                  </div>
                  <div className="col-span-2 flex justify-between gap-2 border-b border-line pb-1">
                    <dt className="text-ink-muted">درآمد</dt>
                    <dd className="m-0">
                      {formatCurrency(night.totalRevenue, pricing.currency)}
                    </dd>
                  </div>
                </dl>
                {night.showtimes.length > 0 && (
                  <ul className="m-0 mt-3 list-none space-y-1 p-0 text-[0.82rem] text-ink-muted">
                    {night.showtimes.map((s) => (
                      <li key={s.time} className="flex justify-between gap-3">
                        <span>سانس {formatTime(s.time)}</span>
                        <span className="text-ink">{toPersianDigits(s.tickets)} عدد</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="mt-8 grid grid-cols-1 gap-[1.2rem] sm:grid-cols-2">
        <div className="flex flex-col gap-[0.45rem]">
          <label htmlFor="night" className="text-[0.88rem] font-medium">
            شب اجرا
          </label>
          <select
            id="night"
            value={nightFilter}
            onChange={(e) => setNightFilter(e.target.value)}
            className="min-h-[3.2rem] w-full cursor-pointer border border-line-strong bg-surface px-4 py-[0.8rem] font-body text-base text-ink transition-[border-color] duration-[250ms] hover:border-ink-muted focus:border-gold focus:outline-none"
          >
            <option value="all">همهٔ شب‌ها</option>
            {nights.map((d) => (
              <option key={d} value={d}>
                {formatPerformanceDate(d)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-[0.45rem]">
          <label htmlFor="search" className="text-[0.88rem] font-medium">
            جستجو
          </label>
          <input
            id="search"
            type="search"
            dir="rtl"
            placeholder="نام، نام خانوادگی، کد بلیت، موبایل یا کد دانشجویی…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-6 border border-accent bg-accent/15 px-4 py-2 text-[0.88rem]">
          {error}
        </p>
      )}

      <div className="mt-6 overflow-x-auto border border-line bg-surface">
        {loading ? (
          <div className="p-8 text-center text-ink-muted">در حال دریافت…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-ink-muted">هیچ بلیتی یافت نشد.</div>
        ) : (
          <table className="w-full min-w-[72rem] border-collapse text-[0.85rem]">
            <thead>
              <tr className="text-ink-muted">
                {[
                  'کد بلیت',
                  'نام',
                  'نام خانوادگی',
                  'موبایل',
                  'تعداد',
                  'بلیت‌ها',
                  'تاریخ اجرا',
                  'سانس',
                  'مبلغ',
                  'وضعیت',
                  'رسید',
                  'زمان ثبت',
                ].map((heading) => (
                  <th
                    key={heading}
                    className="border-b border-line px-3 py-3 text-start font-medium"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="odd:bg-surface-2/40">
                  <td className="border-b border-line px-3 py-2 font-mono" dir="ltr">
                    {b.reference}
                  </td>
                  <td className="border-b border-line px-3 py-2">{b.first_name}</td>
                  <td className="border-b border-line px-3 py-2">{b.last_name}</td>
                  <td className="border-b border-line px-3 py-2" dir="ltr">{b.phone}</td>
                  <td className="border-b border-line px-3 py-2">{toPersianDigits(b.quantity)}</td>
                  <td className="border-b border-line px-3 py-2">
                    {b.attendees && b.attendees.length > 0 ? (
                      <div className="space-y-0.5">
                        {b.attendees.map((a, i) => (
                          <div key={i} className="whitespace-nowrap">
                            {a.firstName} {a.lastName} ·{' '}
                            <span className="text-ink-muted">{rateLabel(a.rate)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-ink-muted">—</span>
                    )}
                  </td>
                  <td className="border-b border-line px-3 py-2">
                    {formatPerformanceDate(b.performance_date)}
                  </td>
                  <td className="border-b border-line px-3 py-2">{formatTime(b.showtime_time)}</td>
                  <td className="border-b border-line px-3 py-2">
                    {formatCurrency(b.total_price, pricing.currency)}
                  </td>
                  <td className="border-b border-line px-3 py-2">
                    {b.status === 'paid' ? (
                      <span className="inline-flex items-center gap-1.5 text-[0.78rem] text-gold">
                        <span className="size-1.5 rounded-full bg-gold" aria-hidden="true" />
                        تأییدشده
                      </span>
                    ) : (
                      <span className="inline-flex flex-col items-start gap-1.5 text-[0.78rem] text-ink-muted">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="size-1.5 rounded-full bg-ink-muted" aria-hidden="true" />
                          در انتظار تأیید
                        </span>
                        <button
                          type="button"
                          onClick={() => handleApprove(b.id)}
                          className="btn btn-primary btn-sm"
                        >
                          تأیید پرداخت
                        </button>
                      </span>
                    )}
                  </td>
                  <td className="border-b border-line px-3 py-2">
                    {b.receipt_url ? (
                      <a
                        href={b.receipt_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block"
                        title={`مشاهدهٔ رسید ${b.reference}`}
                      >
                        <img
                          src={b.receipt_url}
                          alt={`رسید واریز ${b.reference}`}
                          className="h-12 w-12 border border-line object-cover"
                        />
                      </a>
                    ) : (
                      <span className="text-ink-muted">—</span>
                    )}
                  </td>
                  <td className="border-b border-line px-3 py-2">
                    {new Date(b.created_at).toLocaleString('fa-IR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      </div>

      <CheckinList
        rows={checkinRows}
        nightLabel={nightLabel}
        onPrint={() => window.print()}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line bg-surface px-5 py-4">
      <p className="m-0 text-[0.78rem] text-ink-muted">{label}</p>
      <p className="m-0 mt-1 font-display text-[1.3rem] font-bold text-gold">{value}</p>
    </div>
  );
}

function CheckinList({
  rows,
  nightLabel,
  onPrint,
}: {
  rows: CheckinRow[];
  nightLabel: string;
  onPrint: () => void;
}) {
  return (
    <section className="mt-12 print:mt-0" aria-labelledby="checkin-title">
      <div className="flex flex-wrap items-center justify-between gap-4 border-y border-line py-4 print:hidden">
        <div>
          <h2 id="checkin-title" className="m-0 text-[1.15rem] font-bold">
            لیست حضور
          </h2>
          <p className="m-0 mt-1 text-[0.85rem] text-ink-muted">{nightLabel}</p>
        </div>
        <button type="button" onClick={onPrint} className="btn btn-primary">
          چاپ / ذخیره PDF
        </button>
      </div>

      <div className="hidden print:block print:text-black">
        <h1 className="m-0 text-xl font-bold">لیست حضور — {nightLabel}</h1>
        <p className="m-0 mt-1 text-sm">تعداد: {toPersianDigits(rows.length)} نفر</p>
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 text-ink-muted print:hidden">بلیتی برای این شب ثبت نشده است.</p>
      ) : (
        <table className="mt-4 w-full border-collapse text-[0.85rem]">
          <thead>
            <tr className="text-ink-muted print:text-black">
              <th className="border border-line px-3 py-2 text-start print:border-black">ردیف</th>
              <th className="border border-line px-3 py-2 text-start print:border-black">نام</th>
              <th className="border border-line px-3 py-2 text-start print:border-black">نام خانوادگی</th>
              <th className="border border-line px-3 py-2 text-start print:border-black">کد بلیت</th>
              <th className="border border-line px-3 py-2 text-start print:border-black">نوع</th>
              <th className="border border-line px-3 py-2 text-start print:border-black">کد دانشجویی</th>
              <th className="border border-line px-3 py-2 text-start print:border-black">حضور</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.key} className="print:text-black">
                <td className="border border-line px-3 py-2 print:border-black">
                  {toPersianDigits(i + 1)}
                </td>
                <td className="border border-line px-3 py-2 print:border-black">{r.firstName}</td>
                <td className="border border-line px-3 py-2 print:border-black">{r.lastName}</td>
                <td className="border border-line px-3 py-2 font-mono print:border-black" dir="ltr">
                  {r.reference}
                </td>
                <td className="border border-line px-3 py-2 print:border-black">{rateLabel(r.rate)}</td>
                <td className="border border-line px-3 py-2 print:border-black" dir="ltr">
                  {r.studentCode || '—'}
                </td>
                <td className="border border-line px-3 py-2 print:border-black">☐</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
