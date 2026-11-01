import { useState, type FormEvent } from "react";
import { performances } from "../data/performances";
import { pricing, unitPrice } from "../config/pricing";
import type {
  Attendee,
  BookingErrors,
  BookingFormValues,
  BookingRequest,
} from "../types";
import { validateBooking } from "../utils/validation";
import { classifyStudentCode } from "../utils/studentCode";
import {
  formatCurrency,
  formatPerformanceDate,
  formatTime,
  toPersianDigits,
} from "../utils/format";

interface BookingFormProps {
  form: BookingFormValues;
  onChange: (patch: Partial<BookingFormValues>) => void;
  onSubmit: (
    request: BookingRequest,
    receiptFile: File | null,
  ) => Promise<void>;
}

const inputClass =
  "min-h-[3.2rem] w-full appearance-none rounded-none border border-line-strong bg-surface px-4 py-[0.8rem] font-body text-base text-ink transition-[border-color,background-color] duration-[250ms] ease-theater hover:border-ink-muted focus:border-gold focus:bg-surface-2 focus:outline-none aria-invalid:border-accent!";

const selectArrowClass =
  "cursor-pointer bg-[linear-gradient(45deg,transparent_50%,var(--color-ink-muted)_50%),linear-gradient(135deg,var(--color-ink-muted)_50%,transparent_50%)] bg-no-repeat pe-[2.4rem] [background-position:calc(0%_+_1.4rem)_55%,calc(0%_+_1.05rem)_55%] [background-size:6px_6px,6px_6px]";

const labelClass = "text-[0.88rem] font-medium text-ink";

const EMPTY_ATTENDEE: Attendee = {
  firstName: "",
  lastName: "",
  studentCode: "",
};

export function BookingForm({ form, onChange, onSubmit }: BookingFormProps) {
  const [errors, setErrors] = useState<BookingErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const selectedPerformance =
    performances.find((p) => p.id === form.performanceId) ?? performances[0];
  const buyer = form.attendees[0] ?? EMPTY_ATTENDEE;

  const total = form.attendees.reduce(
    (sum, a) =>
      sum + unitPrice(classifyStudentCode(a.studentCode) ?? "regular"),
    0,
  );

  const updateAttendee = (index: number, patch: Partial<Attendee>) => {
    const attendees = form.attendees.map((a, i) =>
      i === index ? { ...a, ...patch } : a,
    );
    onChange({ attendees });
  };

  const setQuantity = (q: number) => {
    const next = Math.max(1, Math.min(pricing.maxTicketsPerOrder, q));
    const attendees = [...form.attendees];
    while (attendees.length < next) attendees.push({ ...EMPTY_ATTENDEE });
    attendees.length = next;
    onChange({ quantity: next, attendees });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const { errors: nextErrors, request } = validateBooking(form);
    setErrors(nextErrors);
    if (!request) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(request, receiptFile);
    } catch {
      setSubmitError("خطایی رخ داد؛ لطفاً دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      className="flex flex-col gap-[1.6rem]"
      onSubmit={handleSubmit}
      noValidate
    >
      {submitError && (
        <p
          role="alert"
          className="border border-accent bg-accent/15 px-[1.2rem] py-[0.9rem] text-[0.92rem]"
        >
          {submitError}
        </p>
      )}
      <div className="grid grid-cols-1 gap-[1.2rem] sm:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-[0.45rem]">
          <label htmlFor="firstName" className={labelClass}>
            نام
          </label>
          <input
            id="firstName"
            type="text"
            autoComplete="given-name"
            value={buyer.firstName}
            onChange={(e) => updateAttendee(0, { firstName: e.target.value })}
            aria-invalid={Boolean(errors.attendees?.[0]?.firstName)}
            className={inputClass}
          />
          {errors.attendees?.[0]?.firstName && (
            <p className="text-[0.8rem] text-error">
              {errors.attendees[0].firstName}
            </p>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-[0.45rem]">
          <label htmlFor="lastName" className={labelClass}>
            نام خانوادگی
          </label>
          <input
            id="lastName"
            type="text"
            autoComplete="family-name"
            value={buyer.lastName}
            onChange={(e) => updateAttendee(0, { lastName: e.target.value })}
            aria-invalid={Boolean(errors.attendees?.[0]?.lastName)}
            className={inputClass}
          />
          {errors.attendees?.[0]?.lastName && (
            <p className="text-[0.8rem] text-error">
              {errors.attendees[0].lastName}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-[1.2rem] sm:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-[0.45rem]">
          <label htmlFor="phone" className={labelClass}>
            شماره موبایل
          </label>
          <input
            id="phone"
            type="tel"
            dir="ltr"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0912 345 6789"
            value={form.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            aria-invalid={Boolean(errors.phone)}
            className={`${inputClass} text-left`}
          />
          {errors.phone ? (
            <p className="text-[0.8rem] text-error">{errors.phone}</p>
          ) : (
            <p className="text-[0.76rem] text-ink-muted">
              بلیت و کد رهگیری به این شماره پیامک می‌شود.
            </p>
          )}
        </div>

        <fieldset className="m-0 flex min-w-0 flex-col gap-[0.45rem] border-0 p-0">
          <legend className="mb-[0.45rem] p-0 text-[0.88rem] font-medium text-ink">
            تعداد بلیت
          </legend>
          <div className="flex items-center justify-between border border-line-strong bg-surface">
            <button
              type="button"
              onClick={() => setQuantity(form.quantity - 1)}
              className="grid size-11 cursor-pointer place-items-center border-none bg-transparent text-lg text-ink transition-colors duration-[250ms] hover:text-gold"
              aria-label="کاهش تعداد"
            >
              −
            </button>
            <output
              className="min-w-[2rem] text-center font-display text-[1.15rem] font-bold"
              aria-live="polite"
            >
              {toPersianDigits(form.quantity)}
            </output>
            <button
              type="button"
              onClick={() => setQuantity(form.quantity + 1)}
              className="grid size-11 cursor-pointer place-items-center border-none bg-transparent text-lg text-ink transition-colors duration-[250ms] hover:text-gold"
              aria-label="افزایش تعداد"
            >
              +
            </button>
          </div>
          {errors.quantity && (
            <p className="text-[0.8rem] text-error">{errors.quantity}</p>
          )}
        </fieldset>
      </div>

      <div className="flex min-w-0 flex-col gap-[0.45rem]">
        <label htmlFor="studentCode" className={labelClass}>
          کد دانشجویی خریدار <span className="text-ink-muted">(اختیاری)</span>
        </label>
        <input
          id="studentCode"
          type="text"
          dir="ltr"
          inputMode="text"
          autoComplete="off"
          placeholder="کد دانشجویی"
          value={buyer.studentCode}
          onChange={(e) => updateAttendee(0, { studentCode: e.target.value })}
          aria-invalid={Boolean(errors.attendees?.[0]?.studentCode)}
          className={`${inputClass} text-left`}
        />
        {errors.attendees?.[0]?.studentCode && (
          <p className="text-[0.8rem] text-error">
            {errors.attendees[0].studentCode}
          </p>
        )}
      </div>
      {form.attendees.slice(1).map((att, idx) => {
        const i = idx + 1;
        const errs = errors.attendees?.[i];
        return (
          <fieldset
            key={i}
            className="m-0 flex min-w-0 flex-col gap-[1rem] border border-line bg-surface p-4"
          >
            <legend className="px-2 text-[0.85rem] font-bold text-gold">
              بلیت {toPersianDigits(i + 1)}
            </legend>
            <div className="grid grid-cols-1 gap-[1.2rem] sm:grid-cols-2">
              <div className="flex min-w-0 flex-col gap-[0.45rem]">
                <label htmlFor={`att-name-${i}`} className={labelClass}>
                  نام
                </label>
                <input
                  id={`att-name-${i}`}
                  type="text"
                  value={att.firstName}
                  onChange={(e) =>
                    updateAttendee(i, { firstName: e.target.value })
                  }
                  aria-invalid={Boolean(errs?.firstName)}
                  className={inputClass}
                />
                {errs?.firstName && (
                  <p className="text-[0.8rem] text-error">{errs.firstName}</p>
                )}
              </div>
              <div className="flex min-w-0 flex-col gap-[0.45rem]">
                <label htmlFor={`att-last-${i}`} className={labelClass}>
                  نام خانوادگی
                </label>
                <input
                  id={`att-last-${i}`}
                  type="text"
                  value={att.lastName}
                  onChange={(e) =>
                    updateAttendee(i, { lastName: e.target.value })
                  }
                  aria-invalid={Boolean(errs?.lastName)}
                  className={inputClass}
                />
                {errs?.lastName && (
                  <p className="text-[0.8rem] text-error">{errs.lastName}</p>
                )}
              </div>
            </div>
            <div className="flex min-w-0 flex-col gap-[0.45rem]">
              <label htmlFor={`att-code-${i}`} className={labelClass}>
                کد دانشجویی <span className="text-ink-muted">(اجباری)</span>
              </label>
              <input
                id={`att-code-${i}`}
                type="text"
                dir="ltr"
                inputMode="text"
                autoComplete="off"
                value={att.studentCode}
                onChange={(e) =>
                  updateAttendee(i, { studentCode: e.target.value })
                }
                aria-invalid={Boolean(errs?.studentCode)}
                className={`${inputClass} text-left`}
              />
              {errs?.studentCode && (
                <p className="text-[0.8rem] text-error">{errs.studentCode}</p>
              )}
            </div>
          </fieldset>
        );
      })}
      <div className="grid grid-cols-1 gap-[1.2rem] sm:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-[0.45rem]">
          <label htmlFor="date" className={labelClass}>
            تاریخ اجرا
          </label>
          <select
            id="date"
            value={form.performanceId}
            onChange={(e) => {
              const perf = performances.find((p) => p.id === e.target.value);
              onChange({
                performanceId: e.target.value,
                showtimeId: perf?.showtimes[0]?.id ?? "",
              });
            }}
            className={`${inputClass} ${selectArrowClass}`}
          >
            {performances.map((p) => (
              <option key={p.id} value={p.id}>
                {formatPerformanceDate(p.dateISO, "full")}
              </option>
            ))}
          </select>
          {errors.performanceId && (
            <p className="text-[0.8rem] text-error">{errors.performanceId}</p>
          )}
        </div>

        <fieldset className="m-0 flex min-w-0 flex-col gap-[0.45rem] border-0 p-0">
          <legend className="mb-[0.45rem] p-0 text-[0.88rem] font-medium text-ink">
            سانس
          </legend>
          <div className="flex flex-wrap gap-[0.7rem]">
            {selectedPerformance.showtimes.map((showtime) => {
              const selected = form.showtimeId === showtime.id;
              return (
                <label key={showtime.id} className="cursor-pointer">
                  <input
                    type="radio"
                    name="showtime"
                    value={showtime.id}
                    checked={selected}
                    onChange={() => onChange({ showtimeId: showtime.id })}
                    className="peer pointer-events-none absolute opacity-0"
                  />
                  <span
                    className={`inline-flex items-baseline gap-[0.6rem] border px-[1.3rem] py-[0.65rem] transition-[border-color,background-color] duration-[250ms] ease-theater peer-focus-visible:outline-2 peer-focus-visible:outline-offset-[3px] peer-focus-visible:outline-gold ${
                      selected
                        ? "border-accent bg-accent/15"
                        : "border-line-strong bg-surface hover:border-gold"
                    }`}
                  >
                    <span
                      className={`font-display text-[1.05rem] font-bold ${selected ? "text-gold" : ""}`}
                    >
                      {formatTime(showtime.time)}
                    </span>
                    {showtime.label && (
                      <span className="text-[0.78rem] text-ink-muted">
                        {showtime.label}
                      </span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
          {errors.showtimeId && (
            <p className="text-[0.8rem] text-error">{errors.showtimeId}</p>
          )}
        </fieldset>
      </div>

      <div className="flex min-w-0 flex-col gap-[0.45rem]">
        <label htmlFor="receipt" className={labelClass}>
          تصویر رسید واریز
        </label>
        <input
          id="receipt"
          type="file"
          accept="image/*"
          onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
          className="cursor-pointer border border-line-strong bg-surface px-4 py-[0.8rem] text-[0.9rem] text-ink file:me-3 file:cursor-pointer file:border-0 file:bg-accent file:px-4 file:py-2 file:text-[0.82rem] file:text-ink"
        />
        <p className="text-[0.76rem] text-ink-muted">
          مبلغ را کارت به کارت واریز کنید و تصویر رسید (اسکرین‌شات) را اینجا
          بارگذاری کنید.
        </p>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="btn btn-primary btn-lg w-full"
      >
        {submitting
          ? "در حال ثبت..."
          : `ثبت رزرو · ${formatCurrency(total, pricing.currency)}`}
      </button>
    </form>
  );
}
