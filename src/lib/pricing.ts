import { SHIPPING } from "@/config/site";

export type FulfilmentKind = "delivery" | "pickup";

export type QuoteLine = { unitPrice: number; compareAtPrice?: number | undefined; qty: number };

export type Quote = {
  subtotal: number;
  /** Sum of MRPs, for the "Discount on MRP" display line. */
  mrpTotal: number;
  savings: number;
  /** null = delivery charge not configured yet; the store confirms it with the order. */
  shipping: number | null;
  /** Promotional discounts. None are configured, so this is always 0 for now. */
  discount: number;
  total: number;
  /** True when every component of `total` is known and can be charged online. */
  final: boolean;
};

export function shippingFor(subtotal: number, kind: FulfilmentKind): number | null {
  if (kind === "pickup") return 0;
  if (SHIPPING.flatFee === null) return null;
  if (SHIPPING.freeAbove !== null && subtotal >= SHIPPING.freeAbove) return 0;
  return SHIPPING.flatFee;
}

/** Pure order maths, shared by the cart display and the server's authoritative recalculation. */
export function quote(lines: QuoteLine[], kind: FulfilmentKind): Quote {
  const subtotal = lines.reduce((n, l) => n + l.unitPrice * l.qty, 0);
  const mrpTotal = lines.reduce(
    (n, l) => n + Math.max(l.compareAtPrice ?? l.unitPrice, l.unitPrice) * l.qty,
    0,
  );
  const shipping = shippingFor(subtotal, kind);
  const discount = 0;
  return {
    subtotal,
    mrpTotal,
    savings: mrpTotal - subtotal,
    shipping,
    discount,
    total: subtotal - discount + (shipping ?? 0),
    final: shipping !== null,
  };
}
