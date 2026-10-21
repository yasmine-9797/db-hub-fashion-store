// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { hmacSha256Hex } from "@/server/crypto.server";
import {
  getOrderForCustomer,
  handleRazorpayWebhook,
  placeOrder,
  retryPayment,
  verifyPayment,
} from "@/server/orders.server";

const base = () => ({
  checkoutId: crypto.randomUUID(),
  items: [{ productId: "p1", size: "M", colour: "Cream", qty: 2 }],
  customer: { name: "Priya Raman", phone: "9876543210", email: "" },
  fulfilment: { kind: "pickup" as const, city: "Chennai" },
  paymentMethod: "pay_at_store" as const,
  notes: "",
});

describe("placing orders (in-memory dev store)", () => {
  it("prices the order on the server from the catalogue", async () => {
    const r = await placeOrder(base());
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.order.subtotal).toBe(1598); // 2 × ₹799 from the catalogue, not from the browser
    expect(r.order.total).toBe(1598);
    expect(r.order.status).toBe("pending");
    expect(r.order.paymentStatus).toBe("unpaid");
    expect(r.order.items[0]?.sku).toBe("DBH-P1-M-CRE");
  });

  it("rejects quantities above stock and sold-out variants", async () => {
    expect(
      await placeOrder({
        ...base(),
        items: [{ productId: "p1", size: "XL", colour: "Cream", qty: 3 }],
      }),
    ).toEqual({ ok: false, error: "ITEM_UNAVAILABLE" });
    expect(
      await placeOrder({
        ...base(),
        items: [{ productId: "p2", size: "XL", colour: "Mid Blue", qty: 1 }],
      }),
    ).toEqual({ ok: false, error: "ITEM_UNAVAILABLE" });
    expect(
      await placeOrder({
        ...base(),
        items: [{ productId: "nope", size: "M", colour: "Cream", qty: 1 }],
      }),
    ).toEqual({ ok: false, error: "ITEM_UNAVAILABLE" });
  });

  it("returns the same order when a checkout is submitted twice", async () => {
    const input = base();
    const a = await placeOrder(input);
    const b = await placeOrder(input);
    expect(a.ok && b.ok && a.orderNumber === b.orderNumber && a.token === b.token).toBe(true);
  });

  it("enforces which payment methods fit the fulfilment", async () => {
    expect(await placeOrder({ ...base(), paymentMethod: "cod" })).toEqual({
      ok: false,
      error: "PAYMENT_METHOD_NOT_ALLOWED",
    });
    expect(await placeOrder({ ...base(), paymentMethod: "razorpay" })).toEqual({
      ok: false,
      error: "PAYMENTS_NOT_CONFIGURED",
    });
  });

  it("rejects malformed input", async () => {
    expect(await placeOrder({ ...base(), customer: { name: "P", phone: "123" } })).toEqual({
      ok: false,
      error: "INVALID_REQUEST",
    });
  });

  it("only shows an order to someone holding its token", async () => {
    const r = await placeOrder(base());
    if (!r.ok) throw new Error("order failed");
    expect((await getOrderForCustomer({ orderNumber: r.orderNumber, token: r.token })).ok).toBe(
      true,
    );
    expect(
      await getOrderForCustomer({ orderNumber: r.orderNumber, token: "x".repeat(40) }),
    ).toEqual({ ok: false, error: "ORDER_NOT_FOUND" });
  });
});

describe("Razorpay payments (provider API mocked)", () => {
  const KEY_SECRET = "test_secret_key_value";
  const WEBHOOK_SECRET = "test_webhook_secret";
  let payment: { status: string; amount: number; currency: string; order_id: string } | null = null;
  let rzCounter = 0;

  beforeEach(() => {
    vi.stubEnv("RAZORPAY_KEY_ID", "rzp_test_abc123");
    vi.stubEnv("RAZORPAY_KEY_SECRET", KEY_SECRET);
    vi.stubEnv("RAZORPAY_WEBHOOK_SECRET", WEBHOOK_SECRET);
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url.endsWith("/orders") && init?.method === "POST") {
          const body = JSON.parse(String(init.body));
          return Response.json({
            id: `order_TEST${++rzCounter}`,
            amount: body.amount,
            currency: "INR",
            receipt: body.receipt,
            status: "created",
          });
        }
        if (url.includes("/payments/"))
          return Response.json({ id: url.split("/").pop(), ...payment });
        return new Response("not found", { status: 404 });
      }),
    );
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    payment = null;
  });

  const startOnline = async () => {
    const r = await placeOrder({ ...base(), paymentMethod: "razorpay" });
    if (!r.ok || !r.razorpay)
      throw new Error(`expected razorpay checkout, got ${JSON.stringify(r)}`);
    return r as typeof r & { razorpay: NonNullable<typeof r.razorpay> };
  };
  const sign = (orderId: string, paymentId: string) =>
    hmacSha256Hex(KEY_SECRET, `${orderId}|${paymentId}`);

  it("creates a Razorpay order for the server-calculated amount in paise", async () => {
    const r = await startOnline();
    expect(r.order.status).toBe("payment_initiated");
    expect(r.razorpay.amountPaise).toBe(159800);
    expect(r.razorpay.keyId).toBe("rzp_test_abc123");
  });

  it("marks the order paid only after a valid signature and a matching captured payment", async () => {
    const r = await startOnline();
    const rzOrder = r.razorpay.razorpayOrderId;
    payment = { status: "captured", amount: 159800, currency: "INR", order_id: rzOrder };
    const forged = await verifyPayment({
      orderNumber: r.orderNumber,
      token: r.token,
      razorpayOrderId: rzOrder,
      razorpayPaymentId: "pay_1",
      razorpaySignature: "deadbeef",
    });
    expect(forged).toEqual({ ok: false, error: "PAYMENT_VERIFICATION_FAILED" });
    const good = await verifyPayment({
      orderNumber: r.orderNumber,
      token: r.token,
      razorpayOrderId: rzOrder,
      razorpayPaymentId: "pay_1",
      razorpaySignature: await sign(rzOrder, "pay_1"),
    });
    expect(good.ok && good.order.status).toBe("paid");
    expect(good.ok && good.order.paymentStatus).toBe("paid");
  });

  it("refuses a payment whose amount doesn't match the order", async () => {
    const r = await startOnline();
    const rzOrder = r.razorpay.razorpayOrderId;
    payment = { status: "captured", amount: 100, currency: "INR", order_id: rzOrder };
    const res = await verifyPayment({
      orderNumber: r.orderNumber,
      token: r.token,
      razorpayOrderId: rzOrder,
      razorpayPaymentId: "pay_2",
      razorpaySignature: await sign(rzOrder, "pay_2"),
    });
    expect(res).toEqual({ ok: false, error: "PAYMENT_VERIFICATION_FAILED" });
    expect(
      (await getOrderForCustomer({ orderNumber: r.orderNumber, token: r.token })).ok &&
        (
          (await getOrderForCustomer({ orderNumber: r.orderNumber, token: r.token })) as {
            order: { status: string };
          }
        ).order.status,
    ).toBe("payment_initiated");
  });

  it("does not mark paid while a payment is only authorised", async () => {
    const r = await startOnline();
    const rzOrder = r.razorpay.razorpayOrderId;
    payment = { status: "authorized", amount: 159800, currency: "INR", order_id: rzOrder };
    const res = await verifyPayment({
      orderNumber: r.orderNumber,
      token: r.token,
      razorpayOrderId: rzOrder,
      razorpayPaymentId: "pay_3",
      razorpaySignature: await sign(rzOrder, "pay_3"),
    });
    expect(res.ok && res.order.status).toBe("payment_initiated");
  });

  it("webhook: rejects bad signatures, accepts good ones and marks the order paid", async () => {
    const r = await startOnline();
    const body = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_w",
            order_id: r.razorpay.razorpayOrderId,
            amount: 159800,
            currency: "INR",
            status: "captured",
          },
        },
      },
    });
    expect((await handleRazorpayWebhook(body, "bad")).status).toBe(400);
    expect(
      (await handleRazorpayWebhook(body, await hmacSha256Hex(WEBHOOK_SECRET, body))).status,
    ).toBe(200);
    const after = await getOrderForCustomer({ orderNumber: r.orderNumber, token: r.token });
    expect(after.ok && after.order.status).toBe("paid");
  });

  it("retry after a failure issues a fresh Razorpay order", async () => {
    const r = await startOnline();
    const body = JSON.stringify({
      event: "payment.failed",
      payload: {
        payment: {
          entity: {
            id: "pay_f",
            order_id: r.razorpay.razorpayOrderId,
            amount: 159800,
            currency: "INR",
            status: "failed",
          },
        },
      },
    });
    await handleRazorpayWebhook(body, await hmacSha256Hex(WEBHOOK_SECRET, body));
    const retry = await retryPayment({ orderNumber: r.orderNumber, token: r.token });
    expect(retry.ok && "razorpay" in retry && retry.razorpay?.razorpayOrderId).not.toBe(
      r.razorpay.razorpayOrderId,
    );
  });
});
