/** Shared domain types for the theater website. */

export interface Showtime {
  id: string;
  /** 24-hour "HH:MM" — stored in a machine-readable (LTR) format. */
  time: string;
  label?: string;
}

export interface Performance {
  id: string;
  /** ISO date "YYYY-MM-DD" (Gregorian, stored internally). */
  dateISO: string;
  showtimes: Showtime[];
}

export interface CastMember {
  id: string;
  name: string;
  role: string;
  /** Optional portrait path under /public, e.g. "/images/cast-1.jpg". */
  image?: string;
}

export interface BookingFormValues {
  firstName: string;
  lastName: string;
  phone: string;
  quantity: number;
  performanceId: string;
  showtimeId: string;
  /** Optional student code; when provided the ticket is issued at the student rate. */
  studentCode: string;
}

/** Normalized, validated booking payload ready for the backend. */
export interface BookingRequest {
  firstName: string;
  lastName: string;
  /** Normalized Iranian mobile: "09xxxxxxxxx". */
  phone: string;
  quantity: number;
  performanceId: string;
  showtimeId: string;
  /** ISO date "YYYY-MM-DD" of the selected performance. */
  performanceDateISO: string;
  /** 24-hour "HH:MM" of the selected showtime. */
  showtimeTime: string;
  /** Normalized student code; empty string for a regular ticket. */
  studentCode: string;
  isStudent: boolean;
  /** Client-computed hint only — the server MUST recalculate the total. */
  expectedTotal: number;
}

export type BookingStatus = 'demo' | 'pending_payment' | 'confirmed' | 'failed';

export interface BookingResult {
  reference: string;
  status: BookingStatus;
  /** Human-readable status note shown on the ticket (Persian). */
  statusNote: string;
  /** Absolute Zarinpal payment URL — present only when status === 'pending_payment'. */
  paymentUrl?: string;
}

/** Everything needed to render the generated ticket. */
export interface TicketData {
  reference: string;
  status: BookingStatus;
  statusNote: string;
  buyerFullName: string;
  quantity: number;
  isStudent: boolean;
  performanceDateISO: string;
  showtime: string;
  unitPrice: number;
  totalPrice: number;
  issuedAtISO: string;
}

/** A booking row as stored in / read from Supabase (snake_case columns). */
export interface BookingRecord {
  id: string;
  reference: string;
  first_name: string;
  last_name: string;
  phone: string;
  quantity: number;
  is_student: boolean;
  student_code: string | null;
  performance_id: string;
  performance_date: string;
  showtime_id: string;
  showtime_time: string;
  unit_price: number;
  total_price: number;
  status: string;
  status_note: string | null;
  created_at: string;
  authority: string | null;
  ref_id: string | null;
  paid_at: string | null;
}

/** Safe subset of a paid booking returned by the verify edge function. */
export interface PaidBooking {
  reference: string;
  first_name: string;
  last_name: string;
  quantity: number;
  is_student: boolean;
  performance_date: string;
  showtime_time: string;
  unit_price: number;
  total_price: number;
  paid_at: string | null;
}

export type BookingErrors = Partial<Record<keyof BookingFormValues, string>>;
