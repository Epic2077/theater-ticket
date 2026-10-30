-- ============================================================================
-- Initial schema for the theater ticket website.
-- Stores every sold ticket + buyer data so the admin dashboard can list and
-- search bookings. Applied with: npm run db:init
-- ============================================================================

-- ---------------------------------------------------------------------------
-- bookings — one row per ticket order.
-- ---------------------------------------------------------------------------
create table if not exists public.bookings (
  id                uuid primary key default gen_random_uuid(),
  reference         text not null unique,               -- ticket code, e.g. TKT-9K2Q7M4F
  first_name        text not null,
  last_name         text not null,
  phone             text not null,                       -- normalized "09xxxxxxxxx"
  quantity          integer not null check (quantity >= 1 and quantity <= 6),
  is_student        boolean not null default false,
  student_code      text,                                -- entered student code (null for regular)
  performance_id    text not null,
  performance_date  date not null,                       -- "YYYY-MM-DD"
  showtime_id       text not null,
  showtime_time     text not null,                       -- "HH:MM"
  unit_price        integer not null default 0,          -- set authoritatively by trigger below
  total_price       integer not null default 0,          -- set authoritatively by trigger below
  status            text not null default 'confirmed',
  status_note       text,
  created_at        timestamptz not null default now(),
  constraint bookings_student_code_check
    check (not is_student or (student_code is not null and length(student_code) > 0))
);

-- ---------------------------------------------------------------------------
-- Server-authoritative pricing: never trust amounts sent by the client.
-- Keep these two constants in sync with src/config/pricing.ts.
-- ---------------------------------------------------------------------------
create or replace function public.set_booking_prices()
returns trigger
language plpgsql
as $$
begin
  if new.is_student then
    new.unit_price := 220000;   -- pricing.studentTicketPrice
  else
    new.unit_price := 350000;   -- pricing.regularTicketPrice
  end if;
  new.total_price := new.quantity * new.unit_price;
  return new;
end;
$$;

create trigger bookings_set_prices
before insert on public.bookings
for each row
execute function public.set_booking_prices();

-- ---------------------------------------------------------------------------
-- Indexes to keep the admin search fast.
-- ---------------------------------------------------------------------------
create index if not exists bookings_created_at_idx on public.bookings (created_at desc);
create index if not exists bookings_last_name_idx on public.bookings (last_name);
create index if not exists bookings_phone_idx on public.bookings (phone);
create index if not exists bookings_reference_idx on public.bookings (reference);

-- ---------------------------------------------------------------------------
-- Row Level Security.
--   * anon          → may INSERT (public booking form). No SELECT, so buyer
--                     data is never readable anonymously.
--   * authenticated → may SELECT (signed-in admin dashboard).
-- ---------------------------------------------------------------------------
alter table public.bookings enable row level security;

create policy "bookings_public_insert"
  on public.bookings for insert
  to anon
  with check (true);

create policy "bookings_admin_select"
  on public.bookings for select
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Explicit Data API grants (also see config.toml api.auto_expose_new_tables).
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant insert on table public.bookings to anon;
grant select on table public.bookings to authenticated;

