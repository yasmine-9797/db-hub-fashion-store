/**
 * Supabase (PostgREST) store using the service-role key from server env. Row-level security in
 * supabase/schema.sql denies the public anon role, so only this server code can read orders.
 * Not yet exercised against a live project — see docs/PRODUCTION-CHECKLIST.md.
 */
import type { OrderStatus } from "@/lib/orders";
import { env } from "../env.server";
import type { EnquiryRecord, OrderPatch, OrderRecord, PaymentRecord, Store } from "./types.server";

export function supabaseConfig() {
  const url = env("SUPABASE_URL")?.replace(/\/$/, "");
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  return url && key ? { url, key } : null;
}

async function rest<T>(path: string, init: RequestInit & { prefer?: string } = {}): Promise<T> {
  const config = supabaseConfig();
  if (!config) throw new Error("Supabase is not configured");
  const res = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      ...(init.prefer ? { Prefer: init.prefer } : {}),
      ...init.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(
      `Supabase ${init.method ?? "GET"} ${path.split("?")[0]} failed: ${res.status} ${body}`,
    );
    throw Object.assign(new Error(`Supabase request failed (${res.status})`), {
      status: res.status,
      body,
    });
  }
  return (res.status === 204 ? null : await res.json()) as T;
}

type OrderRow = {
  id: string;
  order_number: string;
  idempotency_key: string;
  status: OrderStatus;
  payment_status: OrderRecord["paymentStatus"];
  payment_method: OrderRecord["paymentMethod"];
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  fulfilment: OrderRecord["fulfilment"];
  notes: string | null;
  subtotal: number;
  shipping_amount: number | null;
  discount_amount: number;
  total_amount: number;
  currency: "INR";
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  demo: boolean;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  order_items?: ItemRow[];
};
type ItemRow = {
  order_id?: string;
  product_id: string;
  sku: string;
  product_name_snapshot: string;
  size: string;
  colour: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  image_url: string | null;
};

const SELECT = "select=*,order_items(*)";

const toRecord = (r: OrderRow): OrderRecord => ({
  id: r.id,
  orderNumber: r.order_number,
  idempotencyKey: r.idempotency_key,
  status: r.status,
  paymentStatus: r.payment_status,
  paymentMethod: r.payment_method,
  customer: { name: r.customer_name, phone: r.customer_phone, email: r.customer_email ?? "" },
  fulfilment: r.fulfilment,
  notes: r.notes ?? "",
  subtotal: r.subtotal,
  shipping: r.shipping_amount,
  discount: r.discount_amount,
  total: r.total_amount,
  currency: r.currency,
  razorpayOrderId: r.razorpay_order_id ?? undefined,
  razorpayPaymentId: r.razorpay_payment_id ?? undefined,
  demo: r.demo,
  paidAt: r.paid_at ?? undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  items: (r.order_items ?? []).map((i) => ({
    productId: i.product_id,
    sku: i.sku,
    name: i.product_name_snapshot,
    size: i.size,
    colour: i.colour,
    qty: i.quantity,
    unitPrice: i.unit_price,
    lineTotal: i.line_total,
    image: i.image_url ?? undefined,
  })),
});

const one = async (filter: string) => {
  const rows = await rest<OrderRow[]>(`orders?${filter}&${SELECT}&limit=1`);
  return rows[0] ? toRecord(rows[0]) : null;
};

const patchRow = (p: OrderPatch) => ({
  ...(p.status && { status: p.status }),
  ...(p.paymentStatus && { payment_status: p.paymentStatus }),
  ...(p.razorpayOrderId && { razorpay_order_id: p.razorpayOrderId }),
  ...(p.razorpayPaymentId && { razorpay_payment_id: p.razorpayPaymentId }),
  ...(p.paidAt && { paid_at: p.paidAt }),
  updated_at: new Date().toISOString(),
});

export const supabaseStore: Store = {
  kind: "supabase",
  async createOrder(o) {
    let row: OrderRow;
    try {
      [row] = await rest<[OrderRow]>("orders", {
        method: "POST",
        prefer: "return=representation",
        body: JSON.stringify({
          order_number: o.orderNumber,
          idempotency_key: o.idempotencyKey,
          status: o.status,
          payment_status: o.paymentStatus,
          payment_method: o.paymentMethod,
          customer_name: o.customer.name,
          customer_phone: o.customer.phone,
          customer_email: o.customer.email || null,
          fulfilment: o.fulfilment,
          notes: o.notes || null,
          subtotal: o.subtotal,
          shipping_amount: o.shipping,
          discount_amount: o.discount,
          total_amount: o.total,
          currency: o.currency,
          razorpay_order_id: o.razorpayOrderId ?? null,
          demo: o.demo,
          created_at: o.createdAt,
          updated_at: o.updatedAt,
        }),
      });
    } catch (err) {
      // Unique violation on idempotency_key = the same checkout was already submitted.
      if ((err as { status?: number }).status === 409) {
        const existing = await this.findByIdempotencyKey(o.idempotencyKey);
        if (existing) return existing;
      }
      throw err;
    }
    try {
      await rest("order_items", {
        method: "POST",
        body: JSON.stringify(
          o.items.map((i): ItemRow => ({
            order_id: row.id,
            product_id: i.productId,
            sku: i.sku,
            product_name_snapshot: i.name,
            size: i.size,
            colour: i.colour,
            quantity: i.qty,
            unit_price: i.unitPrice,
            line_total: i.lineTotal,
            image_url: i.image ?? null,
          })),
        ),
      });
    } catch (err) {
      // Don't leave an order without its items.
      await rest(`orders?id=eq.${row.id}`, { method: "DELETE" }).catch(() => {});
      throw err;
    }
    return (await this.getOrder(o.orderNumber))!;
  },
  getOrder: (n) => one(`order_number=eq.${encodeURIComponent(n)}`),
  findByIdempotencyKey: (k) => one(`idempotency_key=eq.${encodeURIComponent(k)}`),
  findByRazorpayOrderId: (id) => one(`razorpay_order_id=eq.${encodeURIComponent(id)}`),
  async updateOrder(orderNumber, patch, fromStatuses) {
    const guard = fromStatuses ? `&status=in.(${fromStatuses.join(",")})` : "";
    const rows = await rest<OrderRow[]>(
      `orders?order_number=eq.${encodeURIComponent(orderNumber)}${guard}`,
      {
        method: "PATCH",
        prefer: "return=representation",
        body: JSON.stringify(patchRow(patch)),
      },
    );
    return rows.length ? this.getOrder(orderNumber) : null;
  },
  async listOrders({ status, limit }) {
    const rows = await rest<OrderRow[]>(
      `orders?${SELECT}&order=created_at.desc&limit=${limit}${status ? `&status=eq.${status}` : ""}`,
    );
    return rows.map(toRecord);
  },
  async recordPayment(p) {
    const order = await this.getOrder(p.orderNumber);
    if (!order) return;
    await rest("payments", {
      method: "POST",
      body: JSON.stringify({
        order_id: order.id,
        provider: p.provider,
        provider_order_id: p.providerOrderId,
        provider_payment_id: p.providerPaymentId ?? null,
        payment_status: p.status,
        amount: p.amountPaise,
        verified_at: p.status === "captured" ? new Date().toISOString() : null,
      }),
    });
  },
  async createEnquiry(e) {
    await rest("wholesale_enquiries", {
      method: "POST",
      body: JSON.stringify({
        id: e.id,
        name: e.name,
        phone: e.phone,
        business_name: e.business || null,
        approximate_quantity: e.quantity,
        categories: e.categories,
        message: e.message || null,
        created_at: e.createdAt,
      }),
    });
    return e;
  },
  async listEnquiries(limit) {
    const rows = await rest<
      {
        id: string;
        name: string;
        phone: string;
        business_name: string | null;
        approximate_quantity: string;
        categories: string[] | null;
        message: string | null;
        created_at: string;
      }[]
    >(`wholesale_enquiries?order=created_at.desc&limit=${limit}`);
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      phone: r.phone,
      business: r.business_name ?? "",
      quantity: r.approximate_quantity,
      categories: r.categories ?? [],
      message: r.message ?? "",
      createdAt: r.created_at,
    }));
  },
};
