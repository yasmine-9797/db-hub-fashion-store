/**
 * STARTER CATALOGUE — ILLUSTRATIVE DEMO DATA.
 *
 * These products, prices, colours and stock levels demonstrate the shopping experience.
 * They are NOT confirmed DB Hub inventory. Replace this file with real products (or move
 * the catalogue to the database, see docs/CATALOGUE.md). Every entry is validated against
 * `productSchema` when the module loads, so a typo fails loudly instead of selling wrong.
 */
import korean from "@/assets/cat-korean.jpg";
import unisex from "@/assets/cat-unisex.jpg";
import women from "@/assets/cat-women.jpg";
import dressBlack from "@/assets/p-dress-black.jpg";
import imported from "@/assets/cat-imported.jpg";
import shirt from "@/assets/p-shirt.jpg";
import denim from "@/assets/p-denim.jpg";
import knit from "@/assets/p-knit.jpg";
import hero from "@/assets/hero.jpg";
import blouse from "@/assets/p-blouse.jpg";
import tee from "@/assets/p-tee.jpg";
import satin from "@/assets/p-satin.jpg";
import bomber from "@/assets/p-bomber.jpg";
import { productSchema, type Colour, type Product, type Variant } from "./types";

type Draft = Omit<Product, "variants" | "status" | "demo"> & {
  /** Stock per "size/colour"; anything not listed defaults to `defaultStock`. */
  stock?: Record<string, number>;
  defaultStock?: number;
};

const C = {
  cream: { name: "Cream", hex: "#EEE5D3" },
  denim: { name: "Mid Blue", hex: "#5B7FA6" },
  burgundy: { name: "Burgundy", hex: "#6B1024" },
  black: { name: "Black", hex: "#1F1E1D" },
  blush: { name: "Blush Pink", hex: "#E7B9B4" },
  olive: { name: "Olive", hex: "#5E5B3B" },
  assorted: { name: "Assorted", hex: "#8B7D6B" },
} satisfies Record<string, Colour>;

function build(d: Draft): Product {
  const { stock = {}, defaultStock = 6, ...rest } = d;
  const variants: Variant[] = d.sizes.flatMap((size) =>
    d.colours.map((colour) => ({
      sku: `DBH-${d.id.toUpperCase()}-${size.replace(/\s+/g, "").toUpperCase()}-${colour.name.slice(0, 3).toUpperCase()}`,
      size,
      colour: colour.name,
      stock: stock[`${size}/${colour.name}`] ?? defaultStock,
    })),
  );
  return productSchema.parse({ ...rest, variants, status: "active", demo: true });
}

export const PRODUCTS: Product[] = [
  build({
    id: "p1",
    slug: "oversized-linen-shirt",
    name: "Oversized Linen Shirt",
    shortDescription: "Relaxed drop-shoulder shirt in a soft linen-look weave.",
    description:
      "An easy, oversized shirt with dropped shoulders and a curved hem. Wear it buttoned, open over a tee, or knotted at the waist.",
    category: "unisex",
    type: "shirts-outerwear",
    images: [{ src: shirt, alt: "Cream oversized linen-look shirt on a wooden hanger" }],
    price: 799,
    compareAtPrice: 1199,
    sizes: ["S", "M", "L", "XL"],
    colours: [C.cream],
    featured: true,
    newArrival: true,
    budgetEdit: true,
    addedAt: "2026-10-12",
    fabric: "Linen-look cotton blend",
    fit: "Relaxed, drop shoulder",
    stock: { "XL/Cream": 2 },
  }),
  build({
    id: "p2",
    slug: "washed-denim-jacket",
    name: "Washed Denim Jacket",
    shortDescription: "Classic trucker jacket in a mid-wash denim.",
    description:
      "A dependable trucker silhouette with chest pockets and a button front. Layers over dresses, tees and knits all year round.",
    category: "imported",
    type: "shirts-outerwear",
    images: [{ src: denim, alt: "Mid-wash denim trucker jacket on a wooden hanger" }],
    price: 1299,
    compareAtPrice: 1799,
    sizes: ["M", "L", "XL"],
    colours: [C.denim],
    featured: true,
    newArrival: false,
    budgetEdit: false,
    addedAt: "2026-09-18",
    fabric: "Cotton denim",
    fit: "Regular",
    stock: { "XL/Mid Blue": 0 },
  }),
  build({
    id: "p3",
    slug: "cable-vest-pleat-set",
    name: "Cable Vest & Pleat Set",
    shortDescription: "Cable-knit vest paired with a satin pleated skirt.",
    description:
      "A Korean-inspired two-piece: a burgundy cable-knit vest over a fluid cream pleated skirt. Style together or separately.",
    category: "korean",
    type: "co-ords",
    images: [{ src: knit, alt: "Burgundy cable-knit vest with a cream pleated skirt" }],
    price: 1499,
    compareAtPrice: 1999,
    sizes: ["S", "M", "L"],
    colours: [C.burgundy],
    featured: true,
    newArrival: true,
    budgetEdit: false,
    addedAt: "2026-10-08",
    fit: "Vest: relaxed · Skirt: elasticated waist",
  }),
  build({
    id: "p4",
    slug: "square-neck-midi-dress",
    name: "Square-Neck Midi Dress",
    shortDescription: "Midi dress with puff sleeves and a fitted bodice.",
    description:
      "A flattering square neckline, gently puffed long sleeves and a fitted bodice that flows into a midi skirt.",
    category: "women",
    type: "dresses",
    images: [
      {
        src: women,
        alt: "Model wearing a burgundy square-neck midi dress with puff sleeves",
        colour: "Burgundy",
      },
      // Demo colourway: the burgundy photo digitally recoloured to black (illustrative only).
      {
        src: dressBlack,
        alt: "Model wearing a black square-neck midi dress with puff sleeves",
        colour: "Black",
      },
    ],
    price: 1199,
    compareAtPrice: 1599,
    sizes: ["S", "M", "L", "XL"],
    colours: [C.burgundy, C.black],
    featured: true,
    newArrival: true,
    budgetEdit: false,
    addedAt: "2026-10-15",
    fit: "Fitted bodice, flowing skirt",
    stock: { "S/Black": 0, "XL/Black": 1 },
  }),
  build({
    id: "p5",
    slug: "cropped-knit-cardigan",
    name: "Cropped Knit Cardigan",
    shortDescription: "Soft cropped cardigan with pearl-tone buttons.",
    description:
      "A cosy cropped cardigan in a soft knit, finished with pearl-tone buttons. Pairs with skirts, wide trousers and dresses.",
    category: "korean",
    type: "knitwear",
    images: [{ src: korean, alt: "Model in a cream cropped knit cardigan and pleated skirt" }],
    price: 899,
    compareAtPrice: 1299,
    sizes: ["S", "M", "L"],
    colours: [C.cream],
    featured: false,
    newArrival: true,
    budgetEdit: true,
    addedAt: "2026-10-10",
    fabric: "Soft acrylic-blend knit",
  }),
  build({
    id: "p6",
    slug: "fleece-hoodie-cargo-set",
    name: "Fleece Hoodie & Cargo",
    shortDescription: "Heavyweight hoodie with wide-leg cargo trousers.",
    description:
      "A matching street-style set: a heavyweight fleece hoodie and roomy wide-leg cargos with utility pockets.",
    category: "unisex",
    type: "co-ords",
    images: [
      { src: unisex, alt: "Two models wearing black fleece hoodies and black cargo trousers" },
    ],
    price: 1599,
    compareAtPrice: 2199,
    sizes: ["M", "L", "XL"],
    colours: [C.black],
    featured: false,
    newArrival: false,
    budgetEdit: false,
    addedAt: "2026-09-02",
    fit: "Oversized",
  }),
  build({
    id: "p7",
    slug: "surplus-knit-bundle",
    name: "Surplus Knit Bundle",
    shortDescription: "Assorted imported knits — styles vary by lot.",
    description:
      "A rotating selection of imported surplus knitwear. Styles and colours vary by lot; message us to see what's currently available.",
    category: "imported",
    type: "knitwear",
    images: [
      { src: imported, alt: "Assorted folded knitwear and denim from an imported surplus lot" },
    ],
    price: 999,
    compareAtPrice: 1399,
    sizes: ["Free size"],
    colours: [C.assorted],
    featured: false,
    newArrival: false,
    budgetEdit: true,
    addedAt: "2026-08-28",
    defaultStock: 10,
  }),
  build({
    id: "p8",
    slug: "tailored-wide-suit",
    name: "Tailored Wide Suit",
    shortDescription: "Oversized blazer with pleated wide-leg trousers.",
    description:
      "A statement suit: an oversized single-breasted blazer with matching pleated, wide-leg trousers.",
    category: "women",
    type: "co-ords",
    images: [
      { src: hero, alt: "Model wearing an oversized burgundy blazer and wide-leg trousers" },
    ],
    price: 2199,
    compareAtPrice: 2899,
    sizes: ["S", "M", "L", "XL"],
    colours: [C.burgundy],
    featured: true,
    newArrival: false,
    budgetEdit: false,
    addedAt: "2026-09-25",
    fit: "Oversized blazer, high-rise trousers",
    stock: { "S/Burgundy": 0 },
  }),
  build({
    id: "p9",
    slug: "blush-poplin-shirt-wide-pant",
    name: "Blush Poplin Shirt & Wide Pant",
    shortDescription: "Pastel oversized shirt with cream pleated trousers.",
    description:
      "A soft Korean-inspired pairing: a blush poplin shirt worn loose over pleated cream wide-leg trousers.",
    category: "korean",
    type: "co-ords",
    images: [
      { src: blouse, alt: "Model in a blush pink poplin shirt and cream wide-leg trousers" },
    ],
    price: 1399,
    compareAtPrice: 1899,
    sizes: ["S", "M", "L"],
    colours: [C.blush],
    featured: false,
    newArrival: true,
    budgetEdit: false,
    addedAt: "2026-10-05",
    fabric: "Cotton poplin shirt",
  }),
  build({
    id: "p10",
    slug: "graphic-tee-baggy-jeans",
    name: "Graphic Tee & Baggy Jeans",
    shortDescription: "Washed graphic tee with relaxed wide-leg denim.",
    description: "Everyday street style: a washed black graphic tee with relaxed, wide-leg jeans.",
    category: "unisex",
    type: "tops-tees",
    images: [{ src: tee, alt: "Model in a washed black graphic tee and baggy blue jeans" }],
    price: 1099,
    compareAtPrice: 1599,
    sizes: ["S", "M", "L", "XL"],
    colours: [C.black],
    featured: true,
    newArrival: false,
    budgetEdit: false,
    addedAt: "2026-09-12",
    fit: "Boxy tee, relaxed jeans",
  }),
  build({
    id: "p11",
    slug: "satin-shirt-co-ord",
    name: "Satin Shirt Co-ord",
    shortDescription: "Satin shirt with flowing wide-leg pants.",
    description:
      "A fluid satin shirt and matching wide-leg trousers that move beautifully — dress it up or down.",
    category: "women",
    type: "co-ords",
    images: [{ src: satin, alt: "Model in a burgundy satin shirt and matching wide-leg trousers" }],
    price: 1799,
    compareAtPrice: 2499,
    sizes: ["S", "M", "L", "XL"],
    colours: [C.burgundy],
    featured: true,
    newArrival: true,
    budgetEdit: false,
    addedAt: "2026-10-14",
    fabric: "Satin",
    care: "Gentle hand wash, cool iron",
  }),
  build({
    id: "p12",
    slug: "olive-bomber-jacket",
    name: "Olive Bomber Jacket",
    shortDescription: "Imported nylon bomber with a sleeve zip pocket.",
    description:
      "A lightweight imported bomber in olive nylon with ribbed trims and a utility zip pocket on the sleeve.",
    category: "imported",
    type: "shirts-outerwear",
    images: [{ src: bomber, alt: "Model wearing an olive nylon bomber jacket" }],
    price: 1499,
    compareAtPrice: 2199,
    sizes: ["M", "L", "XL"],
    colours: [C.olive],
    featured: false,
    newArrival: false,
    budgetEdit: false,
    addedAt: "2026-09-08",
    stock: { "M/Olive": 3 },
  }),
];

/** Only active products are sold or listed. */
export const ACTIVE_PRODUCTS = PRODUCTS.filter((p) => p.status === "active");

export const CATALOGUE_IS_DEMO = PRODUCTS.some((p) => p.demo);
