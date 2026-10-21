/**
 * Razorpay integration (server only). Keys come from server environment variables and are never
 * sent to the browser — except the public Key ID, which Razorpay Checkout needs by design.
 * Docs: https://razorpay.com/docs/payments/server-integration/
 */
import { env } from "./env.server";
import { hmacSha256Hex, safeEqual } from "./crypto.server";

const API = "https://api.razorpay.com/v1";

export function razorpayConfig() {
  const keyId = env("RAZORPAY_KEY_ID");
  const keySecret = env("RAZORPAY_KEY_SECRET");
  return keyId && keySecret
    ? { keyId, keySecret, webhookSecret: env("RAZORPAY_WEBHOOK_SECRET") }
    : null;
}

export class RazorpayError extends Error {}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const config = razorpayConfig();
  if (!config) throw new RazorpayError("Razorpay is not configured");
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${btoa(`${config.keyId}:${config.keySecret}`)}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  if (!res.ok) {
    // Log the provider's message server-side only; callers show a generic error.
    console.error(
      `Razorpay ${init.method ?? "GET"} ${path} failed: ${res.status} ${await res.text().catch(() => "")}`,
    );
    throw new RazorpayError(`Razorpay request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
};
export type RazorpayPayment = {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: "created" | "authorized" | "captured" | "refunded" | "failed";
};

export const createRazorpayOrder = (p: {
  amountPaise: number;
  receipt: string;
  notes: Record<string, string>;
}) =>
  call<RazorpayOrder>("/orders", {
    method: "POST",
    body: JSON.stringify({
      amount: p.amountPaise,
      currency: "INR",
      receipt: p.receipt,
      notes: p.notes,
    }),
  });

export const fetchRazorpayPayment = (paymentId: string) =>
  call<RazorpayPayment>(`/payments/${encodeURIComponent(paymentId)}`);

/** Checkout success signature: HMAC_SHA256(order_id + "|" + payment_id, key_secret). */
export async function verifyCheckoutSignature(
  orderId: string,
  paymentId: string,
  signature: string,
) {
  const config = razorpayConfig();
  if (!config) return false;
  return safeEqual(await hmacSha256Hex(config.keySecret, `${orderId}|${paymentId}`), signature);
}

/** Webhook signature: HMAC_SHA256(raw request body, webhook secret). */
export async function verifyWebhookSignature(rawBody: string, signature: string, secret: string) {
  return safeEqual(await hmacSha256Hex(secret, rawBody), signature);
}
