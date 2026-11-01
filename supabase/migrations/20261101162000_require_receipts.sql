-- ============================================================================
-- Require a receipt image for every new booking.
-- ============================================================================

-- Enforce the invariant for all new bookings and for changes to a receipt
-- path, while keeping historical rows without receipts editable.
create or replace function public.require_booking_receipt()
returns trigger
language plpgsql
as $$
begin
  if new.receipt_path is null or length(trim(new.receipt_path)) = 0 then
    raise exception 'A receipt image is required for every booking';
  end if;
  return new;
end;
$$;

drop trigger if exists bookings_require_receipt on public.bookings;
create trigger bookings_require_receipt
before insert or update of receipt_path on public.bookings
for each row
execute function public.require_booking_receipt();

-- The public booking form may run with an authenticated admin session, so both
-- roles need permission to upload the required receipt before inserting.
drop policy if exists "receipts_public_upload" on storage.objects;
create policy "receipts_public_upload"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'receipts');
