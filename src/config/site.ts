/**
 * Central, owner-editable site configuration. Every phone number, link, message and
 * business rule the storefront displays comes from here — change it once, it updates
 * everywhere. Server-only secrets never belong in this file (see .env.example).
 */

export const SITE = {
  name: "DB Hub Cloth Store",
  shortName: "DB Hub",
  tagline: "Women's & Unisex Fashion",
  description:
    "Explore DB Hub Cloth Store for women's fashion, unisex styles, Korean-inspired clothing, imported finds and wholesale enquiries. Shop online or contact us on WhatsApp.",
  /** Public site origin used for canonical URLs and the sitemap. Falls back to the request origin. */
  url: (import.meta.env["VITE_SITE_URL"] as string | undefined)?.replace(/\/$/, "") ?? "",
  locale: "en_IN",
  currency: "INR",
} as const;

export const CONTACT = {
  /** Display format and WhatsApp/tel format (country code, digits only). */
  primary: { display: "+91 93459 26694", e164: "919345926694", tel: "+919345926694" },
  alternate: { display: "+91 93630 34644", e164: "919363034644", tel: "+919363034644" },
  /** WhatsApp chats open with this number. */
  whatsapp: "919345926694",
  instagram: {
    handle: "@db_hub_cloth_store",
    url: "https://www.instagram.com/db_hub_cloth_store/",
  },
  /** Leave empty until a business email is confirmed; nothing renders it while empty. */
  email: "",
} as const;

/**
 * Store locations. Addresses were supplied earlier in the project; opening hours are not
 * confirmed, so they are intentionally absent rather than invented.
 */
export const STORES = [
  {
    city: "Chennai",
    address:
      "Loc Square, Pycrofts Road, Narayana Krishnaraja Puram, Triplicane, Chennai, Tamil Nadu 600005",
    phone: CONTACT.primary,
  },
  {
    city: "Coimbatore",
    address: "Brindhavan Circle, Kuniyamuthur, Coimbatore, Tamil Nadu 641008",
    phone: CONTACT.alternate,
  },
] as const;

/** Rotating messages in the announcement bar. Keep them factual — no invented offers. */
export const ANNOUNCEMENTS = [
  "Your next favourite outfit is waiting",
  "Wholesale & retail fashion",
  "Discover new arrivals at DB Hub",
  "Chennai · Coimbatore",
];

/**
 * Shipping rules. While `flatFee` is null the store has not confirmed delivery charges, so
 * checkout says they are confirmed with the order — and online payment is only offered for
 * store pickup (we never charge an amount that might be wrong).
 */
export const SHIPPING = {
  flatFee: null as number | null,
  /** Orders at or above this subtotal ship free once `flatFee` is set. null = no threshold. */
  freeAbove: null as number | null,
  /** Countries served for home delivery. */
  deliveryCountry: "India",
} as const;

/** Public payment switches. Secrets (Razorpay key secret, webhook secret) live in server env only. */
export const PAYMENTS = {
  /** Cash on delivery for home delivery orders. */
  cod: true,
  /** Pay at the store when collecting a pickup order. */
  payAtStore: true,
  /** Online payment appears only when the server reports Razorpay is configured. */
  razorpay: true,
} as const;

/** Policy pages are drafts until the owner approves them. */
export const POLICIES_APPROVED = false;

export const mapsUrl = (address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
