import { describe, expect, it } from "vitest";
import {
  ACTIVE_PRODUCTS,
  PRODUCTS,
  facets,
  filterProducts,
  findVariant,
  getProduct,
  imagesFor,
  primaryImage,
  productSchema,
  sizeInStock,
  sortProducts,
} from "@/lib/catalog";
import { validateCatalogSearch } from "@/lib/catalog/search-params";
import { ADMIN_TRANSITIONS, checkoutInputSchema } from "@/lib/orders";
import { quote } from "@/lib/pricing";
import { cartMessage, productMessage, waLink } from "@/lib/whatsapp";
import { CONTACT } from "@/config/site";

describe("catalogue", () => {
  it("every product passes the schema and has unique slugs and SKUs", () => {
    for (const p of PRODUCTS) expect(() => productSchema.parse(p)).not.toThrow();
    expect(new Set(PRODUCTS.map((p) => p.slug)).size).toBe(PRODUCTS.length);
    const skus = PRODUCTS.flatMap((p) => p.variants.map((v) => v.sku));
    expect(new Set(skus).size).toBe(skus.length);
  });

  it("rejects a compare-at price that isn't higher than the price", () => {
    const p = { ...PRODUCTS[0]!, compareAtPrice: PRODUCTS[0]!.price };
    expect(productSchema.safeParse(p).success).toBe(false);
  });

  it("search matches every word across name, category and colour", () => {
    expect(filterProducts(ACTIVE_PRODUCTS, { q: "black hoodie" }).map((p) => p.slug)).toEqual([
      "fleece-hoodie-cargo-set",
    ]);
    expect(filterProducts(ACTIVE_PRODUCTS, { q: "dresses" }).map((p) => p.slug)).toContain(
      "square-neck-midi-dress",
    );
    expect(filterProducts(ACTIVE_PRODUCTS, { q: "zzz-nothing" })).toHaveLength(0);
  });

  it("filters by price band and size, and sorts by price", () => {
    const under = filterProducts(ACTIVE_PRODUCTS, { price: "under-1000" });
    expect(under.every((p) => p.price < 1000)).toBe(true);
    expect(filterProducts(ACTIVE_PRODUCTS, { size: "Free size" }).map((p) => p.slug)).toEqual([
      "surplus-knit-bundle",
    ]);
    const prices = sortProducts(ACTIVE_PRODUCTS, "price-asc").map((p) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it("treats sold-out variants as unavailable", () => {
    const jacket = getProduct("washed-denim-jacket")!;
    expect(findVariant(jacket, "XL", "Mid Blue")?.stock).toBe(0);
    expect(sizeInStock(jacket, "XL", "Mid Blue")).toBe(false);
    expect(sizeInStock(jacket, "M", "Mid Blue")).toBe(true);
  });

  it("builds facet counts", () => {
    const f = facets(ACTIVE_PRODUCTS);
    expect(f.sizes.map((s) => s.name)).toEqual(["S", "M", "L", "XL", "Free size"]);
    expect(f.prices.reduce((n, p) => n + p.count, 0)).toBe(ACTIVE_PRODUCTS.length);
  });

  it("drops unknown query params instead of trusting them", () => {
    expect(
      validateCatalogSearch({
        category: "korean",
        size: "XXXL",
        sort: "bogus",
        price: "1000-1499",
        stock: true,
      }),
    ).toEqual({
      q: undefined,
      category: "korean",
      type: undefined,
      size: undefined,
      colour: undefined,
      price: "1000-1499",
      stock: true,
      sort: undefined,
    });
  });
});

describe("pricing", () => {
  const lines = [
    { unitPrice: 799, compareAtPrice: 1199, qty: 2 },
    { unitPrice: 1299, qty: 1 },
  ];
  it("pickup is free and final", () => {
    expect(quote(lines, "pickup")).toEqual({
      subtotal: 2897,
      mrpTotal: 3697,
      savings: 800,
      shipping: 0,
      discount: 0,
      total: 2897,
      final: true,
    });
  });
  it("delivery stays unconfirmed while no delivery fee is configured", () => {
    const q = quote(lines, "delivery");
    expect(q.shipping).toBeNull();
    expect(q.final).toBe(false);
    expect(q.total).toBe(2897);
  });
});

describe("WhatsApp", () => {
  it("uses the configured primary number and encodes the whole message", () => {
    const url = waLink("Hi & welcome\nPrice: ₹1,299 — 50% off?");
    expect(url.startsWith(`https://wa.me/${CONTACT.whatsapp}?text=`)).toBe(true);
    expect(CONTACT.whatsapp).toBe("919345926694");
    expect(decodeURIComponent(url.split("?text=")[1]!)).toBe(
      "Hi & welcome\nPrice: ₹1,299 — 50% off?",
    );
    expect(url).not.toMatch(/[\n &₹]/);
  });

  it("product message lists the chosen variant", () => {
    const m = productMessage({
      name: "Satin Shirt Co-ord",
      sku: "DBH-P11-M-BUR",
      size: "M",
      colour: "Burgundy",
      qty: 2,
      price: 1799,
      url: "https://x.test/p",
    });
    expect(m).toContain("Product: Satin Shirt Co-ord");
    expect(m).toContain("Size: M");
    expect(m).toContain("Colour: Burgundy");
    expect(m).toContain("Quantity: 2");
    expect(m).toContain("Listed Price: ₹1,799");
    expect(m).toContain("Please confirm availability");
  });

  it("cart message says it is an enquiry, not a paid order", () => {
    const m = cartMessage(
      [{ name: "Tee", size: "L", colour: "Black", qty: 1, lineTotal: 1099 }],
      1099,
    );
    expect(m).toContain("1. Tee — Size L, Black × 1 — ₹1,099");
    expect(m).toContain("not a paid order");
  });
});

describe("order rules", () => {
  it("admins can never mark an order paid by hand", () => {
    for (const targets of Object.values(ADMIN_TRANSITIONS)) expect(targets).not.toContain("paid");
  });

  it("checkout input never accepts prices from the browser", () => {
    const parsed = checkoutInputSchema.parse({
      checkoutId: crypto.randomUUID(),
      items: [{ productId: "p1", size: "M", colour: "Cream", qty: 1, price: 1 }],
      customer: { name: "Priya", phone: "+91 98765 43210" },
      fulfilment: { kind: "pickup", city: "Chennai" },
      paymentMethod: "pay_at_store",
    });
    expect(parsed.items[0]).not.toHaveProperty("price");
    expect(parsed.customer.phone).toBe("9876543210");
  });
});

describe("colour photos", () => {
  const dress = getProduct("square-neck-midi-dress")!;

  it("shows the photo for the selected colour", () => {
    const burgundy = imagesFor(dress, "Burgundy");
    const black = imagesFor(dress, "Black");
    expect(burgundy.exact && black.exact).toBe(true);
    expect(burgundy.images[0]?.src).not.toBe(black.images[0]?.src);
    expect(black.images[0]?.alt).toMatch(/black/i);
    expect(primaryImage(dress, "Black")?.src).toBe(black.images[0]?.src);
  });

  it("says which colour is shown when a colour has no photo yet", () => {
    const noBlackPhoto = { ...dress, images: dress.images.filter((i) => i.colour !== "Black") };
    const r = imagesFor(noBlackPhoto, "Black");
    expect(r.exact).toBe(false);
    expect(r.shownColour).toBe("Burgundy");
  });

  it("requires multi-colour products to tag their photos", () => {
    const untagged = { ...dress, images: [{ src: "x.jpg", alt: "x" }] };
    expect(productSchema.safeParse(untagged).success).toBe(false);
  });
});
