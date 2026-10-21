import { z } from "zod";

export const CATEGORY_IDS = ["women", "unisex", "korean", "imported"] as const;
export type CategoryId = (typeof CATEGORY_IDS)[number];

export const PRODUCT_TYPES = [
  "tops-tees",
  "dresses",
  "shirts-outerwear",
  "co-ords",
  "knitwear",
] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens");
const rupees = z.number().int().positive();

export const colourSchema = z.object({
  name: z.string().min(1),
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

export const variantSchema = z.object({
  sku: z.string().min(1),
  size: z.string().min(1),
  colour: z.string().min(1),
  /** Units available to sell. 0 = sold out; purchasing is disabled for that variant. */
  stock: z.number().int().min(0),
});

export const productSchema = z
  .object({
    id: z.string().min(1),
    slug,
    name: z.string().min(2),
    shortDescription: z.string().min(1),
    description: z.string().min(1),
    category: z.enum(CATEGORY_IDS),
    type: z.enum(PRODUCT_TYPES),
    /**
     * Photos. Tag an image with `colour` when it shows a specific colourway; the gallery then
     * switches to it when that colour is selected. Untagged images are shown for every colour.
     */
    images: z
      .array(
        z.object({
          src: z.string().min(1),
          alt: z.string().min(1),
          colour: z.string().min(1).optional(),
        }),
      )
      .min(1),
    /** Selling price in whole rupees. */
    price: rupees,
    /** Original/MRP price; only shown when higher than `price`. */
    compareAtPrice: rupees.optional(),
    sizes: z.array(z.string().min(1)).min(1),
    colours: z.array(colourSchema).min(1),
    variants: z.array(variantSchema).min(1),
    status: z.enum(["active", "draft", "archived"]),
    featured: z.boolean(),
    newArrival: z.boolean(),
    /** Owner-curated "Good style. Smart finds." edit — not an automatic price rule. */
    budgetEdit: z.boolean(),
    /** ISO date the product was added; drives "Newest" sorting. */
    addedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    fabric: z.string().optional(),
    fit: z.string().optional(),
    care: z.string().optional(),
    /** Illustrative starter product, not confirmed DB Hub inventory. */
    demo: z.boolean(),
  })
  .superRefine((p, ctx) => {
    if (p.compareAtPrice !== undefined && p.compareAtPrice <= p.price)
      ctx.addIssue({
        code: "custom",
        path: ["compareAtPrice"],
        message: "compareAtPrice must exceed price",
      });
    for (const img of p.images) {
      if (img.colour && !p.colours.some((c) => c.name === img.colour))
        ctx.addIssue({
          code: "custom",
          path: ["images"],
          message: `Image tagged with unknown colour ${img.colour}`,
        });
    }
    // With several colours the site must know which colour a photo shows, or it can't say so.
    if (p.colours.length > 1 && !p.images.some((i) => i.colour))
      ctx.addIssue({
        code: "custom",
        path: ["images"],
        message: "Tag at least one image with its colour",
      });
    const skus = new Set<string>();
    for (const v of p.variants) {
      if (!p.sizes.includes(v.size))
        ctx.addIssue({
          code: "custom",
          path: ["variants"],
          message: `Unknown size ${v.size} on ${v.sku}`,
        });
      if (!p.colours.some((c) => c.name === v.colour))
        ctx.addIssue({
          code: "custom",
          path: ["variants"],
          message: `Unknown colour ${v.colour} on ${v.sku}`,
        });
      if (skus.has(v.sku))
        ctx.addIssue({ code: "custom", path: ["variants"], message: `Duplicate SKU ${v.sku}` });
      skus.add(v.sku);
    }
  });

export type Colour = z.infer<typeof colourSchema>;
export type Variant = z.infer<typeof variantSchema>;
export type Product = z.infer<typeof productSchema>;

export type Category = {
  id: CategoryId;
  name: string;
  description: string;
  image: string;
};

/** A browsable collection: a category, a product type, or an owner-curated flag. */
export type Collection = {
  slug: string;
  title: string;
  description: string;
  image: string;
  match:
    | { kind: "category"; category: CategoryId }
    | { kind: "type"; type: ProductType }
    | { kind: "flag"; flag: "newArrival" | "budgetEdit" | "featured" };
  /** False when the business has not yet confirmed it stocks this line (editable config). */
  confirmed: boolean;
};
