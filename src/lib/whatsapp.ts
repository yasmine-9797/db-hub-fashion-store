import { CONTACT } from "@/config/site";
import { formatINR } from "@/lib/money";

/** wa.me link with a fully URL-encoded message (newlines, ₹, & and emoji included). */
export const waLink = (message: string, number: string = CONTACT.whatsapp) =>
  `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

const lines = (...parts: Array<string | false | null | undefined>) =>
  parts.filter((p): p is string => typeof p === "string").join("\n");

export function productMessage(p: {
  name: string;
  sku?: string | undefined;
  size?: string | undefined;
  colour?: string | undefined;
  qty: number;
  price: number;
  url?: string | undefined;
}) {
  return lines(
    "Hello DB Hub! I am interested in this product.",
    "",
    `Product: ${p.name}`,
    p.sku && `SKU: ${p.sku}`,
    `Size: ${p.size ?? "Not selected yet"}`,
    `Colour: ${p.colour ?? "Not selected yet"}`,
    `Quantity: ${p.qty}`,
    `Listed Price: ${formatINR(p.price)}`,
    p.url && `Product page: ${p.url}`,
    "",
    "Please confirm availability and ordering details.",
  );
}

export function cartMessage(
  items: {
    name: string;
    sku?: string | undefined;
    size: string;
    colour: string;
    qty: number;
    lineTotal: number;
  }[],
  subtotal: number,
) {
  return lines(
    "Hello DB Hub! I would like to order these items:",
    "",
    ...items.map(
      (i, n) =>
        `${n + 1}. ${i.name} — Size ${i.size}, ${i.colour} × ${i.qty}${i.sku ? ` (${i.sku})` : ""} — ${formatINR(i.lineTotal)}`,
    ),
    "",
    `Subtotal at listed prices: ${formatINR(subtotal)}`,
    "",
    "Please confirm availability, the final price and delivery charges. I understand this is an enquiry, not a paid order.",
  );
}

export function wholesaleMessage(w: {
  name?: string | undefined;
  business?: string | undefined;
  quantity?: string | undefined;
  categories?: string[] | undefined;
  message?: string | undefined;
}) {
  return lines(
    "Hello DB Hub! I'd like to enquire about wholesale / bulk purchasing.",
    "",
    w.name && `Name: ${w.name}`,
    w.business && `Business: ${w.business}`,
    w.quantity && `Approximate quantity: ${w.quantity}`,
    w.categories?.length ? `Interested in: ${w.categories.join(", ")}` : undefined,
    w.message && `Message: ${w.message}`,
    "",
    "Please share available collections and wholesale details.",
  );
}

export function orderMessage(o: {
  orderNumber: string;
  name: string;
  phone: string;
  total: number;
  fulfilment: string;
  payment: string;
}) {
  return lines(
    `Hello DB Hub! I placed order ${o.orderNumber} on the website.`,
    "",
    `Name: ${o.name}`,
    `Mobile: ${o.phone}`,
    `Order total: ${formatINR(o.total)}`,
    `Fulfilment: ${o.fulfilment}`,
    `Payment: ${o.payment}`,
    "",
    "Please confirm availability and next steps.",
  );
}
