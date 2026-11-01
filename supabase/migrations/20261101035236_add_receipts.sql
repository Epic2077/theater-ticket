-- ============================================================================
-- Card-to-card payment: receipt uploads.
-- ============================================================================

-- Store the uploaded receipt screenshot path on each booking.
alter table public.bookings
  add column if not exists receipt_path text;

-- Private storage bucket for payment receipts.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'receipts',
  'receipts',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update
set
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[];

-- Keep existing projects on the same explicit upload contract.
update storage.buckets
set
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
where id = 'receipts';

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
