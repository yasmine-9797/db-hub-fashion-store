/**
 * Order domain model shared by the browser and the server. Contains no secrets — the server
 * keeps idempotency keys and payment signatures out of anything it returns.
 */
import { z } from "zod";
import { STORES } from "@/config/site";
import { INDIAN_STATES, MOBILE_RE, PIN_RE, normaliseMobile } from "@/lib/india";

export const ORDER_STATUSES = [
  "pending",
  "payment_initiated",
  "payment_failed",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending confirmation",
  payment_initiated: "Awaiting payment",
  payment_failed: "Payment failed",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const PAYMENT_STATUSES = ["unpaid", "pending", "paid", "failed", "refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_METHODS = ["razorpay", "cod", "pay_at_store"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  razorpay: "Online payment (Razorpay)",
  cod: "Cash on delivery",
  pay_at_store: "Pay at the store",
};

/**
 * Status changes an administrator may make. "paid" is deliberately absent: online payments are
 * marked paid only by server-side Razorpay verification, never by hand.
 */
export const ADMIN_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["processing", "cancelled"],
  payment_initiated: ["cancelled"],
  payment_failed: ["cancelled"],
  paid: ["processing", "refunded"],
  processing: ["shipped", "delivered", "cancelled"],
  shipped: ["delivered"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

export const STORE_CITIES = STORES.map((s) => s.city) as [string, ...string[]];

const mobile = z
  .string()
  .transform(normaliseMobile)
  .pipe(z.string().regex(MOBILE_RE, "Enter a valid 10-digit mobile number"));

export const addressSchema = z.object({
  line1: z.string().trim().min(5, "Enter your house number and street").max(160),
  line2: z.string().trim().max(120).optional().default(""),
  city: z.string().trim().min(2, "Enter your city").max(60),
  state: z.enum(INDIAN_STATES, { message: "Choose your state" }),
  pin: z.string().trim().regex(PIN_RE, "Enter a valid 6-digit PIN code"),
});

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(80),
  phone: mobile,
  email: z
    .union([z.literal(""), z.string().trim().email("Enter a valid email address").max(120)])
    .optional()
    .default(""),
});

export const fulfilmentSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("delivery"), address: addressSchema }),
  z.object({ kind: z.literal("pickup"), city: z.enum(STORE_CITIES) }),
]);

/** Everything the browser sends to place an order. Prices are never sent — the server looks them up. */
export const checkoutInputSchema = z.object({
  /** Random id per checkout attempt; resubmitting it returns the same order instead of a duplicate. */
  checkoutId: z.string().uuid(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1).max(40),
        size: z.string().min(1).max(20),
        colour: z.string().min(1).max(40),
        qty: z.number().int().min(1).max(20),
      }),
    )
    .min(1, "Your bag is empty")
    .max(30),
  customer: customerSchema,
  fulfilment: fulfilmentSchema,
  paymentMethod: z.enum(PAYMENT_METHODS),
  notes: z.string().trim().max(500, "Max 500 characters").optional().default(""),
});
export type CheckoutInput = z.input<typeof checkoutInputSchema>;

export type OrderItem = {
  productId: string;
  sku: string;
  name: string;
  size: string;
  colour: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
  image?: string | undefined;
};

export type Fulfilment = z.infer<typeof fulfilmentSchema>;

/** What the customer (with a valid order link) and the admin can see. */
export type PublicOrder = {
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  customer: z.infer<typeof customerSchema>;
  fulfilment: Fulfilment;
  notes: string;
  items: OrderItem[];
  subtotal: number;
  /** null = delivery charge to be confirmed by the store. */
  shipping: number | null;
  discount: number;
  total: number;
  currency: "INR";
  createdAt: string;
  updatedAt: string;
  paidAt?: string | undefined;
  demo: boolean;
};

export const fulfilmentLabel = (f: Fulfilment) =>
  f.kind === "delivery" ? "Home delivery" : `Store pickup · ${f.city}`;

/** Machine-readable error codes the server returns; the UI maps them to friendly messages. */
export const CHECKOUT_ERRORS = {
  ORDER_STORAGE_UNAVAILABLE:
    "Online ordering isn't switched on yet. Please send your order on WhatsApp — we'll confirm it there.",
  PAYMENTS_NOT_CONFIGURED:
    "Online payment isn't available yet. Choose another payment option or order on WhatsApp.",
  PAYMENT_METHOD_NOT_ALLOWED:
    "That payment option isn't available for this order. Please choose another.",
  SHIPPING_NOT_CONFIGURED:
    "Delivery charges haven't been set up, so online payment is available for store pickup only.",
  ITEM_UNAVAILABLE:
    "Some items are no longer available in the size or quantity you chose. Please update your bag.",
  PAYMENT_PROVIDER_ERROR: "We couldn't reach the payment provider. Please try again in a moment.",
  PAYMENT_VERIFICATION_FAILED:
    "We couldn't verify this payment. If money was deducted, contact us with your order number.",
  ORDER_NOT_FOUND: "We couldn't find that order. Please check the link.",
  INVALID_REQUEST: "Something in the order looks wrong. Please review your details and try again.",
} as const;
export type CheckoutErrorCode = keyof typeof CHECKOUT_ERRORS;

/** What the browser needs to open Razorpay Checkout for an order (no secrets). */
export type RazorpayCheckout = {
  keyId: string;
  razorpayOrderId: string;
  amountPaise: number;
  currency: "INR";
  prefill: { name: string; contact: string; email?: string | undefined };
};
