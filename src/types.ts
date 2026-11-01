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
}

export type TicketRate = 'regular' | 'student' | 'free';

/** One ticket holder. */
export interface Attendee {
  firstName: string;
  lastName: string;
  /** Empty = regular; "919392077" = free; a 390–404 code = student. */
  studentCode: string;
}

/** An attendee with its resolved rate & price (used for display & storage). */
export interface AttendeeRow extends Attendee {
  rate: TicketRate;
  price: number;
}

export interface BookingFormValues {
  phone: string;
  quantity: number;
  performanceId: string;
  showtimeId: string;
  /** attendees[0] is the buyer; length always equals quantity. */
  attendees: Attendee[];
}

/** Normalized, validated booking payload ready for the backend. */
export interface BookingRequest {
  /** Normalized Iranian mobile: "09xxxxxxxxx". */
  phone: string;
  quantity: number;
  performanceId: string;
  showtimeId: string;
  /** ISO date "YYYY-MM-DD" of the selected performance. */
  performanceDateISO: string;
  /** 24-hour "HH:MM" of the selected showtime. */
  showtimeTime: string;
  attendees: Attendee[];
  /** Client-computed total (Toman) — the server recomputes it too. */
  expectedTotal: number;
}

export type BookingStatus = 'demo' | 'confirmed';

export interface BookingResult {
  reference: string;
  status: BookingStatus;
  /** Human-readable status note shown on the ticket (Persian). */
  statusNote: string;
}

/** Everything needed to render the generated ticket. */
export interface TicketData {
  reference: string;
  status: BookingStatus;
  statusNote: string;
  buyerFullName: string;
  quantity: number;
  totalPrice: number;
  attendees: AttendeeRow[];
  performanceDateISO: string;
  showtime: string;
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
  performance_date: string;
  showtime_time: string;
  total_price: number;
  status: string;
  status_note: string | null;
  created_at: string;
  receipt_path: string | null;
  paid_at: string | null;
  attendees: AttendeeRow[] | null;
}

export interface AttendeeErrors {
  firstName?: string;
  lastName?: string;
  studentCode?: string;
}

export interface BookingErrors {
  phone?: string;
  quantity?: string;
  performanceId?: string;
  showtimeId?: string;
  attendees?: AttendeeErrors[];
}
