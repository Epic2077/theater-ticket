-- ============================================================================
-- Card-to-card payment: receipt uploads.
-- ============================================================================

-- Store the uploaded receipt screenshot path on each booking.
alter table public.bookings
  add column if not exists receipt_path text;

-- Private storage bucket for payment receipts.
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

-- Buyers (anon) may upload a receipt; signed-in admins may read them.
create policy "receipts_public_upload"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'receipts');

create policy "receipts_admin_read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'receipts');

-- Admins may mark a booking as paid (manual verification).
create policy "bookings_admin_update"
  on public.bookings for update
  to authenticated
  using (true)
  with check (true);

grant update on table public.bookings to authenticated;

