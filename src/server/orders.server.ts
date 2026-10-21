/**
 * Order service (server only). The browser sends product ids, variants and quantities; prices,
 * stock, shipping and totals are recalculated here from the catalogue, and payment status changes
 * only after server-side verification with Razorpay.
 */
import { PAYMENTS } from "@/config/site";
import { findVariant, getProductById, primaryImage } from "@/lib/catalog";
import { toPaise } from "@/lib/money";
import {
  checkoutInputSchema,
  type CheckoutErrorCode,
  type OrderItem,
  type PublicOrder,
  type RazorpayCheckout,
} from "@/lib/orders";
import { quote } from "@/lib/pricing";
import { env, isDev } from "./env.server";
import { hmacSha256Hex, randomCode, safeEqual } from "./crypto.server";
import {
  createRazorpayOrder,
  fetchRazorpayPayment,
  razorpayConfig,
  verifyCheckoutSignature,
  verifyWebhookSignature,
} from "./razorpay.server";
import { getStore } from "./store/store.server";
import { toPublic, type OrderRecord, type Store } from "./store/types.server";

export type Fail = { ok: false; error: CheckoutErrorCode };
const fail = (error: CheckoutErrorCode): Fail => ({ ok: false, error });

export type PlacedOrder = {
  ok: true;
  orderNumber: string;
  token: string;
  order: PublicOrder;
  razorpay?: RazorpayCheckout | undefined;
};

// ---- order access tokens -------------------------------------------------------------------
// The confirmation link carries HMAC(secret, orderNumber). Nothing secret is stored, the same
// checkout retried gets the same link back, and order numbers alone reveal nothing.
const g = globalThis as { __dbhubDevTokenSecret?: string };
function tokenSecret() {
  const secret = env("ORDER_TOKEN_SECRET") ?? env("SESSION_SECRET");
  if (secret && secret.length >= 32) return secret;
  // Development only: a per-process random secret (links stop working after a restart — fine locally).
  return isDev() ? (g.__dbhubDevTokenSecret ??= crypto.randomUUID() + crypto.randomUUID()) : null;
}
const tokenFor = async (orderNumber: string, secret: string) =>
  (await hmacSha256Hex(secret, `order:${orderNumber}`)).slice(0, 40);

async function loadAuthorised(
  orderNumber: string,
  token: string,
): Promise<{ store: Store; order: OrderRecord } | Fail> {
  const store = getStore();
  const secret = tokenSecret();
  if (!store || !secret) return fail("ORDER_STORAGE_UNAVAILABLE");
  if (typeof token !== "string" || !safeEqual(await tokenFor(orderNumber, secret), token))
    return fail("ORDER_NOT_FOUND");
  const order = await store.getOrder(orderNumber);
  return order ? { store, order } : fail("ORDER_NOT_FOUND");
}

// ---- configuration ---------------------------------------------------------------------------
export function checkoutCapabilities() {
  const rz = razorpayConfig();
  return {
    orderStorage: Boolean(getStore() && tokenSecret()),
    onlinePayments: Boolean(PAYMENTS.razorpay && rz),
    paymentsTestMode: rz ? rz.keyId.startsWith("rzp_test_") : false,
    devStore: getStore()?.kind === "memory",
  };
}

const newOrderNumber = () => {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `DBH-${ymd}-${randomCode(5)}`;
};

// ---- placing orders --------------------------------------------------------------------------
export async function placeOrder(raw: unknown): Promise<PlacedOrder | Fail> {
  const parsed = checkoutInputSchema.safeParse(raw);
  if (!parsed.success) return fail("INVALID_REQUEST");
  const input = parsed.data;
  const store = getStore();
  const secret = tokenSecret();
  if (!store || !secret) return fail("ORDER_STORAGE_UNAVAILABLE");

  // Same checkout submitted again (double click, network retry) → return the existing order.
  const existing = await store.findByIdempotencyKey(input.checkoutId);
  if (existing) return resume(store, existing, secret);

  // Merge duplicate lines, then price and stock-check every line from the catalogue.
  const merged = new Map<
    string,
    { productId: string; size: string; colour: string; qty: number }
  >();
  for (const l of input.items) {
    const k = `${l.productId}:${l.size}:${l.colour}`;
    const prev = merged.get(k);
    merged.set(k, prev ? { ...prev, qty: prev.qty + l.qty } : { ...l });
  }
  const items: OrderItem[] = [];
  let demo = false;
  for (const l of merged.values()) {
    const product = getProductById(l.productId);
    const variant = product && findVariant(product, l.size, l.colour);
    if (!product || product.status !== "active" || !variant || variant.stock < l.qty)
      return fail("ITEM_UNAVAILABLE");
    demo ||= product.demo;
    items.push({
      productId: product.id,
      sku: variant.sku,
      name: product.name,
      size: l.size,
      colour: l.colour,
      qty: l.qty,
      unitPrice: product.price,
      lineTotal: product.price * l.qty,
      image: primaryImage(product, l.colour)?.src,
    });
  }

  const kind = input.fulfilment.kind;
  const q = quote(
    items.map((i) => ({ unitPrice: i.unitPrice, qty: i.qty })),
    kind,
  );
  const method = input.paymentMethod;
  if (method === "cod" && (kind !== "delivery" || !PAYMENTS.cod))
    return fail("PAYMENT_METHOD_NOT_ALLOWED");
  if (method === "pay_at_store" && (kind !== "pickup" || !PAYMENTS.payAtStore))
    return fail("PAYMENT_METHOD_NOT_ALLOWED");
  if (method === "razorpay") {
    if (!PAYMENTS.razorpay || !razorpayConfig()) return fail("PAYMENTS_NOT_CONFIGURED");
    // Never charge an amount that is still missing its delivery charge.
    if (!q.final) return fail("SHIPPING_NOT_CONFIGURED");
  }

  const now = new Date().toISOString();
  const order: OrderRecord = {
    id: crypto.randomUUID(),
    orderNumber: newOrderNumber(),
    idempotencyKey: input.checkoutId,
    status: method === "razorpay" ? "payment_initiated" : "pending",
    paymentStatus: method === "razorpay" ? "pending" : "unpaid",
    paymentMethod: method,
    customer: input.customer,
    fulfilment: input.fulfilment,
    notes: input.notes,
    items,
    subtotal: q.subtotal,
    shipping: q.shipping,
    discount: q.discount,
    total: q.total,
    currency: "INR",
    createdAt: now,
    updatedAt: now,
    demo,
  };
  const saved = await store.createOrder(order);
  return resume(store, saved, secret);
}

/** Returns an order to the browser; for unpaid online orders, (re)creates its Razorpay order. */
async function resume(
  store: Store,
  order: OrderRecord,
  secret: string,
): Promise<PlacedOrder | Fail> {
  const token = await tokenFor(order.orderNumber, secret);
  if (
    order.paymentMethod !== "razorpay" ||
    !["payment_initiated", "payment_failed"].includes(order.status)
  ) {
    return { ok: true, orderNumber: order.orderNumber, token, order: toPublic(order) };
  }
  const rz = await razorpayCheckoutFor(store, order);
  if (!rz) return fail("PAYMENT_PROVIDER_ERROR");
  return { ok: true, orderNumber: order.orderNumber, token, order: toPublic(order), razorpay: rz };
}

async function razorpayCheckoutFor(
  store: Store,
  order: OrderRecord,
  forceNew = false,
): Promise<RazorpayCheckout | null> {
  const config = razorpayConfig();
  if (!config) return null;
  let razorpayOrderId = forceNew ? undefined : order.razorpayOrderId;
  if (!razorpayOrderId) {
    try {
      const rz = await createRazorpayOrder({
        amountPaise: toPaise(order.total),
        receipt: order.orderNumber,
        notes: { orderNumber: order.orderNumber },
      });
      razorpayOrderId = rz.id;
    } catch {
      return null;
    }
    await store.updateOrder(
      order.orderNumber,
      { razorpayOrderId, status: "payment_initiated", paymentStatus: "pending" },
      ["payment_initiated", "payment_failed"],
    );
  }
  return {
    keyId: config.keyId,
    razorpayOrderId,
    amountPaise: toPaise(order.total),
    currency: "INR",
    prefill: {
      name: order.customer.name,
      contact: `+91${order.customer.phone}`,
      email: order.customer.email || undefined,
    },
  };
}

// ---- payments --------------------------------------------------------------------------------
export async function verifyPayment(p: {
  orderNumber: string;
  token: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const loaded = await loadAuthorised(p.orderNumber, p.token);
  if ("ok" in loaded) return loaded;
  const { store, order } = loaded;
  if (order.status === "paid" || order.paymentStatus === "paid")
    return { ok: true as const, order: toPublic(order) };
  if (order.paymentMethod !== "razorpay" || order.razorpayOrderId !== p.razorpayOrderId)
    return fail("PAYMENT_VERIFICATION_FAILED");
  // 1) The signature proves Razorpay issued this payment for this Razorpay order.
  if (!(await verifyCheckoutSignature(p.razorpayOrderId, p.razorpayPaymentId, p.razorpaySignature)))
    return fail("PAYMENT_VERIFICATION_FAILED");
  // 2) Confirm amount, currency, order and capture status directly with Razorpay.
  let payment;
  try {
    payment = await fetchRazorpayPayment(p.razorpayPaymentId);
  } catch {
    return fail("PAYMENT_PROVIDER_ERROR");
  }
  if (
    payment.order_id !== order.razorpayOrderId ||
    payment.amount !== toPaise(order.total) ||
    payment.currency !== "INR"
  ) {
    return fail("PAYMENT_VERIFICATION_FAILED");
  }
  if (payment.status === "captured") {
    const updated = await markPaid(store, order, payment.id, payment.amount);
    return { ok: true as const, order: toPublic(updated ?? order) };
  }
  if (payment.status === "failed") {
    const updated = await store.updateOrder(
      order.orderNumber,
      { status: "payment_failed", paymentStatus: "failed" },
      ["payment_initiated"],
    );
    return { ok: true as const, order: toPublic(updated ?? order) };
  }
  // "authorized": money is held but not captured yet; the payment.captured webhook completes it.
  return { ok: true as const, order: toPublic(order) };
}

async function markPaid(store: Store, order: OrderRecord, paymentId: string, amountPaise: number) {
  const updated = await store.updateOrder(
    order.orderNumber,
    {
      status: "paid",
      paymentStatus: "paid",
      razorpayPaymentId: paymentId,
      paidAt: new Date().toISOString(),
    },
    ["payment_initiated", "payment_failed"],
  );
  if (updated) {
    await store
      .recordPayment({
        orderNumber: order.orderNumber,
        provider: "razorpay",
        providerOrderId: order.razorpayOrderId!,
        providerPaymentId: paymentId,
        status: "captured",
        amountPaise,
      })
      .catch((e) => console.error("recordPayment failed", e));
  }
  return updated;
}

/** Called when Razorpay Checkout reports a failure; never downgrades a paid order. */
export async function reportPaymentFailure(p: { orderNumber: string; token: string }) {
  const loaded = await loadAuthorised(p.orderNumber, p.token);
  if ("ok" in loaded) return loaded;
  const updated = await loaded.store.updateOrder(
    p.orderNumber,
    { status: "payment_failed", paymentStatus: "failed" },
    ["payment_initiated"],
  );
  return { ok: true as const, order: toPublic(updated ?? loaded.order) };
}

export async function retryPayment(p: { orderNumber: string; token: string }) {
  const loaded = await loadAuthorised(p.orderNumber, p.token);
  if ("ok" in loaded) return loaded;
  const { store, order } = loaded;
  if (
    order.paymentMethod !== "razorpay" ||
    !["payment_initiated", "payment_failed"].includes(order.status)
  ) {
    return { ok: true as const, order: toPublic(order) };
  }
  // A fresh Razorpay order after a failure avoids reusing one Razorpay may have closed.
  const rz = await razorpayCheckoutFor(store, order, order.status === "payment_failed");
  return rz
    ? { ok: true as const, order: toPublic(order), razorpay: rz }
    : fail("PAYMENT_PROVIDER_ERROR");
}

export async function getOrderForCustomer(p: { orderNumber: string; token: string }) {
  const loaded = await loadAuthorised(p.orderNumber, p.token);
  if ("ok" in loaded) return loaded;
  return { ok: true as const, order: toPublic(loaded.order) };
}

// ---- webhook ---------------------------------------------------------------------------------
type WebhookPayment = {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
};

/** Razorpay webhook: verifies the signature, then reconciles payment.captured / order.paid / payment.failed. */
export async function handleRazorpayWebhook(
  rawBody: string,
  signature: string | null,
): Promise<{ status: number; body: string }> {
  const secret = razorpayConfig()?.webhookSecret;
  const store = getStore();
  if (!secret || !store) return { status: 503, body: "Webhook not configured" };
  if (!signature || !(await verifyWebhookSignature(rawBody, signature, secret)))
    return { status: 400, body: "Invalid signature" };

  let event: { event?: string; payload?: { payment?: { entity?: WebhookPayment } } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return { status: 400, body: "Invalid JSON" };
  }
  const payment = event.payload?.payment?.entity;
  if (!payment?.order_id) return { status: 200, body: "Ignored" };
  const order = await store.findByRazorpayOrderId(payment.order_id);
  if (!order) return { status: 200, body: "Unknown order" };

  if (event.event === "payment.captured" || event.event === "order.paid") {
    if (payment.amount !== toPaise(order.total) || payment.currency !== "INR") {
      console.error(`Webhook amount mismatch for ${order.orderNumber}`);
      return { status: 200, body: "Amount mismatch — not marked paid" };
    }
    await markPaid(store, order, payment.id, payment.amount);
  } else if (event.event === "payment.failed") {
    await store.updateOrder(
      order.orderNumber,
      { status: "payment_failed", paymentStatus: "failed" },
      ["payment_initiated"],
    );
  }
  return { status: 200, body: "OK" };
}
