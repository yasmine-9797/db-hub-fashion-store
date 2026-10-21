import korean from "@/assets/cat-korean.jpg";
import unisex from "@/assets/cat-unisex.jpg";
import women from "@/assets/cat-women.jpg";
import imported from "@/assets/cat-imported.jpg";
import shirt from "@/assets/p-shirt.jpg";
import tee from "@/assets/p-tee.jpg";
import satin from "@/assets/p-satin.jpg";
import bomber from "@/assets/p-bomber.jpg";
import blouse from "@/assets/p-blouse.jpg";
import type { Category, CategoryId, Collection, ProductType } from "./types";

/** The business's confirmed product lines (from the brand brief). */
export const CATEGORIES: Category[] = [
  {
    id: "women",
    name: "Women's Wear",
    description: "Dresses, sets and everyday pieces.",
    image: satin,
  },
  {
    id: "unisex",
    name: "Unisex Fashion",
    description: "Oversized fits and essentials for everyone.",
    image: unisex,
  },
  {
    id: "korean",
    name: "Korean Fashion",
    description: "Soft tailoring, knits and layered looks.",
    image: korean,
  },
  {
    id: "imported",
    name: "Imported & Surplus",
    description: "Rotating imported finds and surplus lots.",
    image: imported,
  },
];

export const TYPE_LABELS: Record<ProductType, string> = {
  "tops-tees": "Tops & Tees",
  dresses: "Dresses",
  "shirts-outerwear": "Shirts & Outerwear",
  "co-ords": "Co-ord Sets",
  knitwear: "Knitwear",
};

export const categoryName = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)?.name ?? id;

/**
 * Every collection page at /collections/<slug>. Product-type collections are marked
 * `confirmed: false` until the owner confirms they are regular lines — edit freely.
 */
export const COLLECTIONS: Collection[] = [
  ...CATEGORIES.map((c): Collection => ({
    slug: c.id,
    title: c.name,
    description: c.description,
    image: c.image,
    match: { kind: "category", category: c.id },
    confirmed: true,
  })),
  {
    slug: "tops-tees",
    title: "Tops & Tees",
    description: "Easy tops and tees for every day.",
    image: tee,
    match: { kind: "type", type: "tops-tees" },
    confirmed: false,
  },
  {
    slug: "dresses",
    title: "Dresses",
    description: "Midi, mini and everything between.",
    image: women,
    match: { kind: "type", type: "dresses" },
    confirmed: false,
  },
  {
    slug: "shirts-outerwear",
    title: "Shirts & Outerwear",
    description: "Shirts, jackets and layering pieces.",
    image: bomber,
    match: { kind: "type", type: "shirts-outerwear" },
    confirmed: false,
  },
  {
    slug: "co-ords",
    title: "Co-ord Sets",
    description: "Matching sets, ready to wear.",
    image: satin,
    match: { kind: "type", type: "co-ords" },
    confirmed: false,
  },
  {
    slug: "knitwear",
    title: "Knitwear",
    description: "Cardigans, vests and soft knits.",
    image: korean,
    match: { kind: "type", type: "knitwear" },
    confirmed: false,
  },
  {
    slug: "budget-finds",
    title: "Budget Finds",
    description: "Good style. Smart finds — an edit chosen by our team.",
    image: shirt,
    match: { kind: "flag", flag: "budgetEdit" },
    confirmed: true,
  },
  {
    slug: "new-arrivals",
    title: "New Arrivals",
    description: "The latest pieces to land at DB Hub.",
    image: blouse,
    match: { kind: "flag", flag: "newArrival" },
    confirmed: true,
  },
];

export const getCollection = (slug: string) => COLLECTIONS.find((c) => c.slug === slug);

/** Homepage "Shop by category" order, as set in the brand brief. */
export const HOME_CATEGORY_SLUGS = [
  "women",
  "unisex",
  "korean",
  "tops-tees",
  "dresses",
  "shirts-outerwear",
  "budget-finds",
  "new-arrivals",
];
