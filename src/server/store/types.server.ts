import type { OrderStatus, PaymentStatus, PublicOrder } from "@/lib/orders";

/** Full order as stored. Never returned to the browser as-is — see `toPublic`. */
export type OrderRecord = PublicOrder & {
  id: string;
  idempotencyKey: string;
  razorpayOrderId?: string | undefined;
  razorpayPaymentId?: string | undefined;
};

export type OrderPatch = Partial<{
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  paidAt: string;
}>;

export type EnquiryRecord = {
  id: string;
  name: string;
  phone: string;
  business: string;
  quantity: string;
  categories: string[];
  message: string;
  createdAt: string;
};

export type PaymentRecord = {
  orderNumber: string;
  provider: "razorpay";
  providerOrderId: string;
  providerPaymentId?: string | undefined;
  status: "captured" | "authorized" | "failed" | "refunded";
  amountPaise: number;
};

export interface Store {
  kind: "supabase" | "memory";
  createOrder(order: OrderRecord): Promise<OrderRecord>;
  getOrder(orderNumber: string): Promise<OrderRecord | null>;
  findByIdempotencyKey(key: string): Promise<OrderRecord | null>;
  findByRazorpayOrderId(razorpayOrderId: string): Promise<OrderRecord | null>;
  /**
   * Applies `patch` only if the order is currently in one of `fromStatuses` (when given) —
   * a compare-and-set that stops a late webhook from overwriting a newer state.
   */
  updateOrder(
    orderNumber: string,
    patch: OrderPatch,
    fromStatuses?: OrderStatus[],
  ): Promise<OrderRecord | null>;
  listOrders(opts: { status?: OrderStatus | undefined; limit: number }): Promise<OrderRecord[]>;
  recordPayment(p: PaymentRecord): Promise<void>;
  createEnquiry(e: EnquiryRecord): Promise<EnquiryRecord>;
  listEnquiries(limit: number): Promise<EnquiryRecord[]>;
}

export const toPublic = ({
  id: _id,
  idempotencyKey: _k,
  razorpayOrderId: _ro,
  razorpayPaymentId: _rp,
  ...pub
}: OrderRecord): PublicOrder => pub;
