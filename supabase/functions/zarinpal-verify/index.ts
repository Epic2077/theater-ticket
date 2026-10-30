/**
 * Zarinpal payment verify (public edge function — verify_jwt = false).
 * Confirms a payment with Zarinpal and marks the booking as paid.
 */
import { createClient } from 'npm:@supabase/supabase-js@2';

const MERCHANT_ID = Deno.env.get('ZARINPAL_MERCHANT_ID') ?? '';
const SANDBOX = (Deno.env.get('ZARINPAL_SANDBOX') ?? 'true') === 'true';

const API_BASE = SANDBOX
  ? 'https://sandbox.zarinpal.com/pg/v4/payment'
  : 'https://payment.zarinpal.com/pg/v4/payment';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function bookingForClient(b: any) {
  return {
    reference: b.reference,
    first_name: b.first_name,
    last_name: b.last_name,
    quantity: b.quantity,
    is_student: b.is_student,
    performance_date: b.performance_date,
    showtime_time: b.showtime_time,
    unit_price: b.unit_price,
    total_price: b.total_price,
    paid_at: b.paid_at,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (!MERCHANT_ID) {
    return json({ ok: false, message: 'کلید درگاه (merchant_id) تنظیم نشده است.' }, 500);
  }

  let body: { authority?: string };
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, message: 'بدنهٔ درخواست نامعتبر است.' }, 400);
  }

  const authority = (body.authority ?? '').trim();
  if (!authority) {
    return json({ ok: false, message: 'authority الزامی است.' }, 400);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  const { data: booking, error: loadError } = await supabase
    .from('bookings')
    .select('*')
    .eq('authority', authority)
    .maybeSingle();

  if (loadError || !booking) {
    return json({ ok: false, message: 'تراکنش یافت نشد.' }, 404);
  }

  if (booking.status === 'paid') {
    // Already verified — return the existing booking (idempotent).
    return json({ ok: true, ref_id: booking.ref_id, booking: bookingForClient(booking) });
  }

  const amount = booking.total_price * 10; // Toman → Rial
  const zpResponse = await fetch(`${API_BASE}/verify.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ merchant_id: MERCHANT_ID, amount, authority }),
  });
  const zp = await zpResponse.json();
  const code = zp?.data?.code;

  if (code === 100 || code === 101) {
    // 100 = verified now, 101 = already verified earlier.
    const refId = zp?.data?.ref_id ? String(zp.data.ref_id) : (booking.ref_id ?? '');
    const { data: updated, error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'paid',
        ref_id: refId,
        paid_at: new Date().toISOString(),
        status_note: 'پرداخت موفق — بلیت تأیید شد.',
      })
      .eq('reference', booking.reference)
      .select()
      .single();

    if (updateError || !updated) {
      return json({ ok: false, message: 'خطا در ثبت پرداخت.' }, 500);
    }

    return json({ ok: true, ref_id: refId, booking: bookingForClient(updated) });
  }

  const message = zp?.errors?.message || zp?.data?.message || 'پرداخت تأیید نشد.';
  return json({ ok: false, code, message }, 402);
});
