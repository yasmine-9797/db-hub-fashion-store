# DB Hub Cloth Store — storefront

Fashion e-commerce site for **DB Hub Cloth Store** (Chennai & Coimbatore): women's, unisex, Korean-inspired, imported and surplus clothing, retail and wholesale.

Built with TanStack Start (React 19, TypeScript, Vite), Tailwind CSS v4 and server functions. This project is connected to [Lovable](https://lovable.dev/projects/32bda43f-e48f-4aa6-bdbf-21a3b0249e47) — commits pushed to `main` sync back to the Lovable editor.

## What's included

| Area | Where |
| --- | --- |
| Home (hero, categories, featured, budget edit, lookbook, Instagram, wholesale CTA) | `src/routes/index.tsx` |
| Shop all, collections, search — filters (category, type, size, colour, price, stock) and sorting in the URL | `src/routes/shop.tsx`, `collections/$slug.tsx`, `search.tsx`, `src/components/catalog/` |
| Product page — gallery, size × colour variants with stock rules, quantity, add to bag, buy now, WhatsApp order | `src/routes/products/$slug.tsx` |
| Bag drawer + `/cart` page (persisted in the browser), wishlist | `src/components/cart/`, `src/routes/cart.tsx`, `wishlist.tsx` |
| Checkout with review step, delivery/pickup, COD, pay at store, Razorpay, WhatsApp | `src/routes/checkout.tsx` |
| Order confirmation (private link) and payment status | `src/routes/order/$orderNumber.tsx`, `payment-status.tsx` |
| Server: price recalculation, stock checks, idempotent orders, Razorpay verification + webhook | `src/server/` |
| Admin (password protected): orders, status changes, wholesale enquiries | `src/routes/admin.tsx`, `src/server/admin.server.ts` |
| Wholesale page + enquiry form, About, Contact, FAQ, policy drafts, 404 | `src/routes/` |
| SEO: per-page meta, canonical/OG, breadcrumbs JSON-LD, `sitemap.xml`, `robots.txt` | `src/lib/seo.ts`, `src/routes/sitemap[.]xml.ts`, `robots[.]txt.ts` |

Brand settings (phone numbers, WhatsApp number, announcement messages, shipping rule, payment switches) live in **`src/config/site.ts`**. The product catalogue is **illustrative demo data** in `src/lib/catalog/products.ts` until real inventory is added.

## Quick start

```sh
npm install
cp .env.example .env   # fill in what you have; everything is optional for local development
npm run dev            # http://localhost:8080
npm test               # unit tests (catalogue, pricing, WhatsApp, orders, payment verification)
```

Without any environment variables the site runs fully in development: orders are kept in memory, online payment shows "being set up", and WhatsApp ordering works.

## Documentation

- [docs/SETUP.md](docs/SETUP.md) — environment variables, database, admin access, deployment.
- [docs/PRODUCTION-CHECKLIST.md](docs/PRODUCTION-CHECKLIST.md) — enabling Razorpay, going live, and everything that still needs credentials or owner input.
- [docs/CATALOGUE.md](docs/CATALOGUE.md) — replacing the demo products with real inventory.
