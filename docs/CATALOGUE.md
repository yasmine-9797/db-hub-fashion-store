# Managing the product catalogue

## Where products live

`src/lib/catalog/products.ts` — a list of products built with a small `build({...})` helper. Every product is validated against `productSchema` (`src/lib/catalog/types.ts`) when the site starts, so mistakes (a sale price above MRP, a variant with an unknown size, duplicate SKUs) stop the build instead of reaching customers.

The current entries are **illustrative demo products** (`demo: true`). The site labels them as demo listings, and they never emit product structured data for search engines.

## Replacing demo products with real ones

1. Add photos to `src/assets/` (portrait 3:4, ~768×1024 JPG, under ~150 KB each) and import them at the top of `products.ts`.
2. For each product, fill in:
   - `id` (unique, short), `slug` (URL: lowercase-with-hyphens), `name`, `shortDescription`, `description`;
   - `category`: `women` | `unisex` | `korean` | `imported`; `type`: `tops-tees` | `dresses` | `shirts-outerwear` | `co-ords` | `knitwear`;
   - `images`: `[{ src, alt, colour? }]` — the first image is the main one; add more for a gallery. For products in several colours, tag each photo with its colour (`colour: "Black"`): the product page, quick view, cards, bag and orders then show the photo of the colour the customer picked. Untagged photos (e.g. a fabric close-up) show for every colour. A multi-colour product must tag at least one photo; if a colour has no photo yet, the page says which colour the photo shows;
   - `price` (whole rupees) and optional `compareAtPrice` (MRP, must be higher);
   - `sizes` and `colours` (`{ name, hex }`); variants are generated for every size × colour;
   - `stock`: per-variant quantities as `"M/Black": 4` (others use `defaultStock`); 0 = sold out;
   - flags: `featured` (home page), `newArrival`, `budgetEdit` ("Good style. Smart finds."), and `addedAt` (YYYY-MM-DD, used for "Newest");
   - optional `fabric`, `fit`, `care` — leave out anything you can't confirm.
3. Set `demo: false` for real products (in `build()`, or remove the `demo: true` default once all products are real). When no demo products remain, the demo notices disappear automatically.
4. Run `npm test` and `npm run dev`, and check the product pages.

Collections (`src/lib/catalog/collections.ts`) are rules, not lists: categories and types group automatically; *Budget Finds* and *New Arrivals* follow the product flags. Product-type collections are marked `confirmed: false` until you confirm those lines are regular stock.

## Moving the catalogue to the database (next step)

Stock is currently **checked** at checkout but not **decremented**, because the catalogue is part of the code. For live inventory:

1. Create the `categories`, `products`, `product_variants` and `product_images` tables (already in `supabase/schema.sql`) and import the products.
2. Replace `getProductById` / `ACTIVE_PRODUCTS` in `src/lib/catalog/index.ts` with server reads (e.g. a server function used by route loaders).
3. In `placeOrder` (`src/server/orders.server.ts`), decrement stock atomically, e.g. with a Postgres function:
   `update product_variants set stock_quantity = stock_quantity - $qty where sku = $sku and stock_quantity >= $qty returning id;` — reject the order if no row updates. Restore stock when an order is cancelled.
4. Add an admin product editor (create/edit products, upload images to Supabase Storage) behind `requireAdmin()`.
