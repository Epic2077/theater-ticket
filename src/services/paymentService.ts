import { supabase } from '../lib/supabase';
import type { PaidBooking } from '../types';

function buildCallbackUrl(): string {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#/payment/callback`;
}

export async function startZarinpalPayment(reference: string): Promise<{ url: string }> {
  if (!supabase) throw new Error('اتصال به سامانهٔ پرداخت برقرار نیست.');
  const { data, error } = await supabase.functions.invoke('zarinpal-request', {
    body: { reference, callbackUrl: buildCallbackUrl() },
  });
  if (error) throw new Error(`خطا در اتصال به درگاه پرداخت: ${error.message}`);
  if (!data?.ok) throw new Error(data?.message || 'خطا در اتصال به درگاه پرداخت.');
  return { url: data.url };
}

export async function verifyZarinpalPayment(
  authority: string,
): Promise<{ refId: string; booking: PaidBooking }> {
  if (!supabase) throw new Error('اتصال به سامانهٔ پرداخت برقرار نیست.');
  const { data, error } = await supabase.functions.invoke('zarinpal-verify', {
    body: { authority },
  });
  if (error) throw new Error(`خطا در تأیید پرداخت: ${error.message}`);
  if (!data?.ok) throw new Error(data?.message || 'پرداخت تأیید نشد.');
  return { refId: data.ref_id, booking: data.booking as PaidBooking };
}