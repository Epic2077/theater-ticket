-- ============================================================================
-- Per-ticket attendees + authoritative total computed from the attendees list.
-- ============================================================================

-- Store every ticket holder (name, last name, student code, rate, price).
alter table public.bookings
  add column if not exists attendees jsonb not null default '[]'::jsonb;

-- Replace the old single-student pricing trigger with one that sums per-ticket
-- prices from the attendees list. regular=125000 / student=85000 / free=0.
drop trigger if exists bookings_set_prices on public.bookings;
drop function if exists public.set_booking_prices();

create or replace function public.set_booking_total()
returns trigger
language plpgsql
as $$
declare
  att jsonb;
  code text;
  price int;
  total int := 0;
begin
  for att in select value from jsonb_array_elements(coalesce(new.attendees, '[]'::jsonb)) loop
    code := coalesce(att->>'studentCode', '');
    if code = '919392077' then
      price := 0;                                   -- free code
    elsif code ~ '^((39[0-9])|(40[0-4]))[0-9]{5}$' then
      price := 85000;                               -- student (390–404 prefix)
    else
      price := 125000;                              -- regular
    end if;
    total := total + price;
  end loop;

  new.total_price := total;
  new.quantity := coalesce(jsonb_array_length(new.attendees), 0);
  return new;
end;
$$;

create trigger bookings_set_total
before insert on public.bookings
for each row
execute function public.set_booking_total();

