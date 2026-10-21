/**
 * Admin authentication and operations (server only). Access requires ADMIN_PASSWORD; the session
 * lives in an encrypted, HTTP-only cookie sealed with SESSION_SECRET. Hiding the admin link is not
 * the protection — every admin server function calls requireAdmin() first.
 */
// Aliased: despite the name this is a server cookie helper, not a React hook.
import { useSession as openSession } from "@tanstack/react-start/server";
import { ADMIN_TRANSITIONS, type OrderStatus } from "@/lib/orders";
import { env, isDev } from "./env.server";
import { hmacSha256Hex, safeEqual } from "./crypto.server";
import { getStore } from "./store/store.server";
import { toPublic } from "./store/types.server";

type AdminSession = { admin?: boolean; since?: number };

export function adminConfig() {
  const password = env("ADMIN_PASSWORD");
  const secret = env("SESSION_SECRET");
  return password && secret && secret.length >= 32 ? { password, secret } : null;
}

const session = (secret: string) =>
  openSession<AdminSession>({
    password: secret,
    name: "dbhub_admin",
    maxAge: 60 * 60 * 8,
    sessionHeader: false,
    cookie: { httpOnly: true, secure: !isDev(), sameSite: "strict", path: "/" },
  });

export async function isAdmin() {
  const config = adminConfig();
  if (!config) return false;
  return Boolean((await session(config.secret)).data.admin);
}

export class Unauthorised extends Error {}

export async function requireAdmin() {
  if (!(await isAdmin())) throw new Unauthorised("Not signed in");
}

// Best-effort brute-force brake (per server instance).
const attempts = new Map<string, { count: number; until: number }>();

export async function login(password: string, ip: string) {
  const config = adminConfig();
  if (!config)
    return { ok: false as const, error: "Admin access is not configured on this server." };
  const a = attempts.get(ip);
  if (a && a.until > Date.now())
    return { ok: false as const, error: "Too many attempts. Try again in a few minutes." };
  // Compare HMACs so the check takes the same time regardless of where the strings differ.
  const ok = safeEqual(
    await hmacSha256Hex(config.secret, password),
    await hmacSha256Hex(config.secret, config.password),
  );
  if (!ok) {
    const count = (a?.count ?? 0) + 1;
    attempts.set(ip, { count, until: count >= 5 ? Date.now() + 10 * 60_000 : 0 });
    return { ok: false as const, error: "Incorrect password." };
  }
  attempts.delete(ip);
  await (await session(config.secret)).update({ admin: true, since: Date.now() });
  return { ok: true as const };
}

export async function logout() {
  const config = adminConfig();
  if (config) await (await session(config.secret)).clear();
}

export async function adminListOrders(status?: OrderStatus) {
  await requireAdmin();
  const store = getStore();
  if (!store) return { storage: null, orders: [] };
  return {
    storage: store.kind,
    orders: (await store.listOrders({ status, limit: 200 })).map(toPublic),
  };
}

export async function adminUpdateStatus(orderNumber: string, to: OrderStatus) {
  await requireAdmin();
  const store = getStore();
  const order = store && (await store.getOrder(orderNumber));
  if (!store || !order) return { ok: false as const, error: "Order not found." };
  if (!ADMIN_TRANSITIONS[order.status].includes(to))
    return { ok: false as const, error: `Can't move an order from ${order.status} to ${to}.` };
  const updated = await store.updateOrder(
    orderNumber,
    { status: to, ...(to === "refunded" && { paymentStatus: "refunded" as const }) },
    [order.status],
  );
  return updated
    ? { ok: true as const, order: toPublic(updated) }
    : { ok: false as const, error: "The order changed meanwhile — refresh and try again." };
}

/** Cash on delivery / pay-at-store only: record that the store has been paid. */
export async function adminMarkCashCollected(orderNumber: string) {
  await requireAdmin();
  const store = getStore();
  const order = store && (await store.getOrder(orderNumber));
  if (!store || !order) return { ok: false as const, error: "Order not found." };
  if (order.paymentMethod === "razorpay")
    return {
      ok: false as const,
      error: "Online payments are confirmed by Razorpay verification only.",
    };
  if (order.paymentStatus !== "unpaid")
    return { ok: false as const, error: "Payment is already recorded." };
  const updated = await store.updateOrder(orderNumber, {
    paymentStatus: "paid",
    paidAt: new Date().toISOString(),
  });
  return updated
    ? { ok: true as const, order: toPublic(updated) }
    : { ok: false as const, error: "Update failed." };
}

export async function adminListEnquiries() {
  await requireAdmin();
  const store = getStore();
  return store ? store.listEnquiries(200) : [];
}
