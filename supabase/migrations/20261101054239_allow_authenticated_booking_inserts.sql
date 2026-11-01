-- The public booking form can be submitted while an admin session is active.
-- In that case PostgREST uses the authenticated role instead of anon.
drop policy if exists "bookings_public_insert" on public.bookings;
create policy "bookings_public_insert"
  on public.bookings for insert
  to anon, authenticated
  with check (true);

grant insert on table public.bookings to anon, authenticated;