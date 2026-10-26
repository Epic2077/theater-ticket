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
  isStudent: boolean;
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
  isStudent: boolean;
  /** Client-computed hint only — the server MUST recalculate the total. */
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
  isStudent: boolean;
  performanceDateISO: string;
  showtime: string;
  unitPrice: number;
  totalPrice: number;
  issuedAtISO: string;
}

export type BookingErrors = Partial<Record<keyof BookingFormValues, string>>;
