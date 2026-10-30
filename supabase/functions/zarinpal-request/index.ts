/**
 * Zarinpal payment request (public edge function — verify_jwt = false).
 * Creates a Zarinpal payment authority for a pending booking and returns the
 * payment page URL. The merchant id is read from a server secret and is never
 * exposed to the browser.
 */
import { createClient } from 'npm:@supabase/supabase-js@2';

const MERCHANT_ID = Deno.env.get('ZARINPAL_MERCHANT_ID') ?? '';
const SANDBOX = (Deno.env.get('ZARINPAL_SANDBOX') ?? 'true') === 'true';

const API_BASE = SANDBOX
  ? 'https://sandbox.zarinpal.com/pg/v4/payment'
  : 'https://payment.zarinpal.com/pg/v4/payment';
const START_PAY_BASE = SANDBOX
  ? 'https://sandbox.zarinpal.com/pg/StartPay'
  : 'https://payment.zarinpal.com/pg/StartPay';

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (!MERCHANT_ID) {
    return json({ ok: false, message: 'کلید درگاه (merchant_id) تنظیم نشده است.' }, 500);
  }

  let body: { reference?: string; callbackUrl?: string };
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, message: 'بدنهٔ درخواست نامعتبر است.' }, 400);
  }

  const reference = (body.reference ?? '').trim();
  const callbackUrl = (body.callbackUrl ?? '').trim();
  if (!reference || !callbackUrl) {
    return json({ ok: false, message: 'reference و callbackUrl الزامی است.' }, 400);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  const { data: booking, error: loadError } = await supabase
    .from('bookings')
    .select('*')
    .eq('reference', reference)
    .maybeSingle();

  if (loadError || !booking) {
    return json({ ok: false, message: 'سفارش یافت نشد.' }, 404);
  }
  if (booking.status !== 'pending') {
    return json({ ok: false, message: 'این سفارش قبلاً پردازش شده است.' }, 400);
  }

  // Prices are authoritative on the server (set by the DB trigger).
  const amount = booking.total_price * 10; // Toman → Rial
  const description = `بلیت نمایش — ${booking.quantity} عدد — کد ${reference}`;

  const zpResponse = await fetch(`${API_BASE}/request.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      merchant_id: MERCHANT_ID,
      amount,
      currency: 'IRR',
      description,
      callback_url: callbackUrl,
      metadata: { mobile: booking.phone },
    }),
  });
  const zp = await zpResponse.json();
  const authority = zp?.data?.authority;
  const code = zp?.data?.code;

  if (code !== 100 || !authority) {
    const message = zp?.errors?.message || zp?.data?.message || 'خطا در ایجاد تراکنش زرین‌پال';
    return json({ ok: false, code, message }, 502);
  }

  const { error: updateError } = await supabase
    .from('bookings')
    .update({ authority })
    .eq('reference', reference);
  if (updateError) {
    return json({ ok: false, message: 'خطا در ذخیرهٔ شناسهٔ تراکنش.' }, 500);
  }

  return json({ ok: true, authority, url: `${START_PAY_BASE}/${authority}` });
});
