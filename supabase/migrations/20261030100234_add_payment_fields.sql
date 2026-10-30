-- ============================================================================
-- Add Zarinpal payment fields to the bookings table.
-- ============================================================================

alter table public.bookings
  add column if not exists authority text,
  add column if not exists ref_id text,
  add column if not exists paid_at timestamptz;

-- New bookings start as "pending" until payment is verified.
alter table public.bookings alter column status set default 'pending';

create index if not exists bookings_authority_idx on public.bookings (authority);
create index if not exists bookings_status_idx on public.bookings (status);

