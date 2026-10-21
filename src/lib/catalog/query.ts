import { CATEGORIES, TYPE_LABELS } from "./collections";
import type { Collection, Product, Variant } from "./types";

export const SORTS = {
  featured: "Featured",
  newest: "Newest",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  discount: "Biggest discount",
} as const;
export type SortKey = keyof typeof SORTS;

/** Price bands for the filter; bounds are inclusive rupees, null = open-ended. */
export const PRICE_BANDS = {
  "under-1000": { label: "Under ₹1,000", min: null, max: 999 },
  "1000-1499": { label: "₹1,000 – ₹1,499", min: 1000, max: 1499 },
  "1500-1999": { label: "₹1,500 – ₹1,999", min: 1500, max: 1999 },
  "2000-plus": { label: "₹2,000 & above", min: 2000, max: null },
} as const;
export type PriceBand = keyof typeof PRICE_BANDS;

export type CatalogFilters = {
  collection?: Collection | undefined;
  q?: string | undefined;
  size?: string | undefined;
  colour?: string | undefined;
  price?: PriceBand | undefined;
  inStock?: boolean | undefined;
  savedIds?: string[] | undefined;
};

export const totalStock = (p: Product) => p.variants.reduce((n, v) => n + v.stock, 0);
export const isInStock = (p: Product) => p.variants.some((v) => v.stock > 0);
export const discountPct = (p: Product) =>
  p.compareAtPrice && p.compareAtPrice > p.price
    ? Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100)
    : 0;

export const findVariant = (p: Product, size: string, colour: string): Variant | undefined =>
  p.variants.find((v) => v.size === size && v.colour === colour);

/** A size is selectable for a colour only if that exact variant has stock. */
export const sizeInStock = (p: Product, size: string, colour?: string) =>
  p.variants.some((v) => v.size === size && (!colour || v.colour === colour) && v.stock > 0);
export const colourInStock = (p: Product, colour: string, size?: string) =>
  p.variants.some((v) => v.colour === colour && (!size || v.size === size) && v.stock > 0);

export function matchesCollection(p: Product, c: Collection) {
  switch (c.match.kind) {
    case "category":
      return p.category === c.match.category;
    case "type":
      return p.type === c.match.type;
    case "flag":
      return p[c.match.flag];
  }
}

const normalise = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s]/gu, " ");

/** Text searched for a product: name, category, type, colours and descriptions. */
function haystack(p: Product) {
  const category = CATEGORIES.find((c) => c.id === p.category)?.name ?? "";
  return normalise(
    [
      p.name,
      category,
      TYPE_LABELS[p.type],
      ...p.colours.map((c) => c.name),
      p.shortDescription,
      p.description,
    ].join(" "),
  );
}

/** Every word of the query must appear (in any order), so "black hoodie" finds the hoodie set. */
export function matchesQuery(p: Product, q: string) {
  const words = normalise(q).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const text = haystack(p);
  return words.every((w) => text.includes(w) || (w.endsWith("s") && text.includes(w.slice(0, -1))));
}

export function filterProducts(products: Product[], f: CatalogFilters) {
  const band = f.price ? PRICE_BANDS[f.price] : undefined;
  return products.filter(
    (p) =>
      (!f.collection || matchesCollection(p, f.collection)) &&
      (!f.q || matchesQuery(p, f.q)) &&
      (!f.size || p.sizes.includes(f.size)) &&
      (!f.colour || p.colours.some((c) => c.name === f.colour)) &&
      (!band ||
        ((band.min === null || p.price >= band.min) &&
          (band.max === null || p.price <= band.max))) &&
      (!f.inStock || isInStock(p)) &&
      (!f.savedIds || f.savedIds.includes(p.id)),
  );
}

export function sortProducts(products: Product[], sort: SortKey) {
  const list = [...products];
  switch (sort) {
    case "newest":
      return list.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    case "discount":
      return list.sort((a, b) => discountPct(b) - discountPct(a));
    // Featured first, then newest, keeping in-stock pieces ahead of sold-out ones.
    case "featured":
      return list.sort(
        (a, b) =>
          Number(isInStock(b)) - Number(isInStock(a)) ||
          Number(b.featured) - Number(a.featured) ||
          b.addedAt.localeCompare(a.addedAt),
      );
  }
}

/** Filter options with counts, computed from the products in view before size/colour/price filters. */
export function facets(products: Product[]) {
  const sizes = new Map<string, number>();
  const colours = new Map<string, { hex: string; count: number }>();
  for (const p of products) {
    for (const s of p.sizes) sizes.set(s, (sizes.get(s) ?? 0) + 1);
    for (const c of p.colours)
      colours.set(c.name, { hex: c.hex, count: (colours.get(c.name)?.count ?? 0) + 1 });
  }
  const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "Free size"];
  return {
    sizes: [...sizes]
      .sort(([a], [b]) => ((sizeOrder.indexOf(a) + 99) % 99) - ((sizeOrder.indexOf(b) + 99) % 99))
      .map(([name, count]) => ({ name, count })),
    colours: [...colours].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.count - a.count),
    prices: (Object.keys(PRICE_BANDS) as PriceBand[]).map((key) => ({
      key,
      label: PRICE_BANDS[key].label,
      count: products.filter((p) => filterProducts([p], { price: key }).length).length,
    })),
  };
}

/**
 * Photos to show for a colour: images tagged with that colour first, then untagged ones.
 * `exact` is false when the chosen colour has no photo yet; `shownColour` says which colour the
 * photos actually show, so the page can be honest about it.
 */
export function imagesFor(p: Product, colour?: string | null) {
  const untagged = p.images.filter((i) => !i.colour);
  const forColour = colour ? p.images.filter((i) => i.colour === colour) : [];
  if (forColour.length)
    return { images: [...forColour, ...untagged], exact: true, shownColour: colour ?? undefined };
  const firstTagged = p.images.find((i) => i.colour)?.colour;
  const images = [
    ...(firstTagged ? p.images.filter((i) => i.colour === firstTagged) : []),
    ...untagged,
  ];
  return {
    images: images.length ? images : p.images,
    exact: !colour || p.colours.length <= 1 || colour === firstTagged,
    shownColour: firstTagged ?? p.colours[0]?.name,
  };
}

/** Main photo for a product, optionally for a specific colour (cards, bag lines, orders). */
export const primaryImage = (p: Product, colour?: string | null) => imagesFor(p, colour).images[0];
