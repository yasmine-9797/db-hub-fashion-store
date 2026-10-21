/**
 * In-memory store for LOCAL DEVELOPMENT ONLY. Data disappears on restart and isn't shared between
 * server instances, so it is never selected in production (see store.server.ts).
 */
import type { EnquiryRecord, OrderRecord, PaymentRecord, Store } from "./types.server";

type Data = {
  orders: Map<string, OrderRecord>;
  enquiries: EnquiryRecord[];
  payments: PaymentRecord[];
};
// Kept on globalThis so hot reloads during development don't wipe test orders.
const g = globalThis as { __dbhubMemoryStore?: Data };
const data: Data = (g.__dbhubMemoryStore ??= { orders: new Map(), enquiries: [], payments: [] });

const clone = <T>(v: T): T => structuredClone(v);

export const memoryStore: Store = {
  kind: "memory",
  async createOrder(order) {
    if (data.orders.has(order.orderNumber)) throw new Error("Duplicate order number");
    const existing = [...data.orders.values()].find(
      (o) => o.idempotencyKey === order.idempotencyKey,
    );
    if (existing) return clone(existing);
    data.orders.set(order.orderNumber, clone(order));
    return clone(order);
  },
  async getOrder(orderNumber) {
    const o = data.orders.get(orderNumber);
    return o ? clone(o) : null;
  },
  async findByIdempotencyKey(key) {
    const o = [...data.orders.values()].find((x) => x.idempotencyKey === key);
    return o ? clone(o) : null;
  },
  async findByRazorpayOrderId(id) {
    const o = [...data.orders.values()].find((x) => x.razorpayOrderId === id);
    return o ? clone(o) : null;
  },
  async updateOrder(orderNumber, patch, fromStatuses) {
    const o = data.orders.get(orderNumber);
    if (!o || (fromStatuses && !fromStatuses.includes(o.status))) return null;
    Object.assign(o, patch, { updatedAt: new Date().toISOString() });
    return clone(o);
  },
  async listOrders({ status, limit }) {
    return [...data.orders.values()]
      .filter((o) => !status || o.status === status)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit)
      .map(clone);
  },
  async recordPayment(p) {
    data.payments.push(clone(p));
  },
  async createEnquiry(e) {
    data.enquiries.unshift(clone(e));
    return clone(e);
  },
  async listEnquiries(limit) {
    return data.enquiries.slice(0, limit).map(clone);
  },
};
