-- ============================================================================
-- Ensure the bookings RLS policies and grants are correct (idempotent).
-- Fixes "new row violates row-level security policy" when anon inserts.
-- ============================================================================

alter table public.bookings enable row level security;

drop policy if exists "bookings_public_insert" on public.bookings;
create policy "bookings_public_insert"
  on public.bookings for insert
  to anon
  with check (true);

drop policy if exists "bookings_admin_select" on public.bookings;
create policy "bookings_admin_select"
  on public.bookings for select
  to authenticated
  using (true);

grant usage on schema public to anon, authenticated;
grant insert on table public.bookings to anon;
grant select, update on table public.bookings to authenticated;

