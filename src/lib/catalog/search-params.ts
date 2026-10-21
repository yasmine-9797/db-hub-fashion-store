import { CATEGORY_IDS, PRODUCT_TYPES, type CategoryId, type ProductType } from "./types";
import { PRICE_BANDS, SORTS, type PriceBand, type SortKey } from "./query";
import { PRODUCTS } from "./products";

export type CatalogSearch = {
  q?: string | undefined;
  category?: CategoryId | undefined;
  type?: ProductType | undefined;
  size?: string | undefined;
  colour?: string | undefined;
  price?: PriceBand | undefined;
  stock?: boolean | undefined;
  sort?: SortKey | undefined;
};

const ALL_SIZES = new Set(PRODUCTS.flatMap((p) => p.sizes));
const ALL_COLOURS = new Set(PRODUCTS.flatMap((p) => p.colours.map((c) => c.name)));
const oneOf = <T extends string>(list: readonly T[], v: unknown) =>
  (list as readonly unknown[]).includes(v) ? (v as T) : undefined;

/**
 * Validates catalogue query params. Every key is returned (undefined when invalid) because the
 * router merges this result over the raw query — omitting a key would let a bad value through.
 */
export function validateCatalogSearch(s: Record<string, unknown>): CatalogSearch {
  const q =
    typeof s["q"] === "string"
      ? s["q"].slice(0, 80)
      : typeof s["q"] === "number"
        ? String(s["q"])
        : undefined;
  return {
    q: q?.trim() ? q : undefined,
    category: oneOf(CATEGORY_IDS, s["category"]),
    type: oneOf(PRODUCT_TYPES, s["type"]),
    size: typeof s["size"] === "string" && ALL_SIZES.has(s["size"]) ? s["size"] : undefined,
    colour:
      typeof s["colour"] === "string" && ALL_COLOURS.has(s["colour"]) ? s["colour"] : undefined,
    price: oneOf(Object.keys(PRICE_BANDS) as PriceBand[], s["price"]),
    stock: s["stock"] === true ? true : undefined,
    sort: oneOf(Object.keys(SORTS) as SortKey[], s["sort"]),
  };
}
