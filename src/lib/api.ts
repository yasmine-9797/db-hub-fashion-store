/**
 * Server functions — the only entry points the browser can call. Each validates its input and
 * delegates to server-only modules (*.server.ts), which never ship to the browser. Cross-site
 * calls are rejected by the CSRF middleware in src/start.ts.
 */
import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";
import { enquirySchema } from "@/lib/enquiry";
import { ORDER_STATUSES } from "@/lib/orders";
import {
  adminConfig,
  adminListEnquiries,
  adminListOrders,
  adminMarkCashCollected,
  adminUpdateStatus,
  isAdmin,
  login,
  logout,
} from "@/server/admin.server";
import {
  checkoutCapabilities,
  getOrderForCustomer,
  placeOrder,
  reportPaymentFailure,
  retryPayment,
  verifyPayment,
} from "@/server/orders.server";
import { getStore } from "@/server/store/store.server";

const orderRef = z.object({
  orderNumber: z.string().regex(/^DBH-\d{6}-[A-Z0-9]{5}$/),
  token: z.string().min(16).max(80),
});

export const getCheckoutCapabilities = createServerFn({ method: "GET" }).handler(async () =>
  checkoutCapabilities(),
);

// Validated in full inside placeOrder (so error codes stay friendly); here we only require an object.
export const placeOrderFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .handler(async ({ data }) => placeOrder(data));

export const verifyPaymentFn = createServerFn({ method: "POST" })
  .validator(
    orderRef.extend({
      razorpayOrderId: z.string().min(1).max(64),
      razorpayPaymentId: z.string().min(1).max(64),
      razorpaySignature: z.string().min(1).max(256),
    }),
  )
  .handler(async ({ data }) => verifyPayment(data));

export const reportPaymentFailureFn = createServerFn({ method: "POST" })
  .validator(orderRef)
  .handler(async ({ data }) => reportPaymentFailure(data));
export const retryPaymentFn = createServerFn({ method: "POST" })
  .validator(orderRef)
  .handler(async ({ data }) => retryPayment(data));
export const getOrderFn = createServerFn({ method: "GET" })
  .validator(orderRef)
  .handler(async ({ data }) => getOrderForCustomer(data));

export const submitEnquiryFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .handler(async ({ data }) => {
    const parsed = enquirySchema.safeParse(data);
    if (!parsed.success) return { ok: false as const, error: "INVALID_REQUEST" as const };
    const e = parsed.data;
    if (e.website) return { ok: true as const, stored: false }; // honeypot hit: pretend success, store nothing
    const store = getStore();
    if (!store) return { ok: false as const, error: "STORAGE_UNAVAILABLE" as const };
    await store.createEnquiry({
      id: crypto.randomUUID(),
      name: e.name,
      phone: e.phone,
      business: e.business,
      quantity: e.quantity,
      categories: e.categories,
      message: e.message,
      createdAt: new Date().toISOString(),
    });
    return { ok: true as const, stored: true };
  });

// ---- admin ----
export const adminStatusFn = createServerFn({ method: "GET" }).handler(async () => ({
  configured: Boolean(adminConfig()),
  signedIn: await isAdmin(),
}));

export const adminLoginFn = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string().min(1).max(200) }))
  .handler(async ({ data }) =>
    login(data.password, getRequestIP({ xForwardedFor: true }) ?? "unknown"),
  );

export const adminLogoutFn = createServerFn({ method: "POST" }).handler(async () => {
  await logout();
  return { ok: true };
});

export const adminOrdersFn = createServerFn({ method: "GET" })
  .validator(z.object({ status: z.enum(ORDER_STATUSES).optional() }))
  .handler(async ({ data }) => adminListOrders(data.status));

export const adminUpdateStatusFn = createServerFn({ method: "POST" })
  .validator(z.object({ orderNumber: z.string().min(1).max(40), to: z.enum(ORDER_STATUSES) }))
  .handler(async ({ data }) => adminUpdateStatus(data.orderNumber, data.to));

export const adminMarkCashCollectedFn = createServerFn({ method: "POST" })
  .validator(z.object({ orderNumber: z.string().min(1).max(40) }))
  .handler(async ({ data }) => adminMarkCashCollected(data.orderNumber));

export const adminEnquiriesFn = createServerFn({ method: "GET" }).handler(async () =>
  adminListEnquiries(),
);
