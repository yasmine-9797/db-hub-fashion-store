# Setup & deployment

## 1. Local development

```sh
npm install
cp .env.example .env
npm run dev        # http://localhost:8080
npm test           # vitest
npx tsc --noEmit   # type check
```

In development (`npm run dev`) the server uses an **in-memory order store** and a random per-process secret for order links, so checkout works without any accounts. Restarting the dev server clears test orders.

## 2. Environment variables

See `.env.example` for the full list. Summary:

| Variable | Needed for | Notes |
| --- | --- | --- |
| `VITE_SITE_URL` | Canonical URLs, Open Graph, sitemap | Public. Your live origin, e.g. `https://dbhub.in` |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Saving orders and wholesale enquiries in production | Server only. Without them, production checkout offers WhatsApp only |
| `SESSION_SECRET` | Admin login cookie; also signs order links | Server only, ≥ 32 random characters |
| `ORDER_TOKEN_SECRET` | Private order links | Optional (falls back to `SESSION_SECRET`) |
| `ADMIN_PASSWORD` | `/admin` | Server only. Admin stays locked until set |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Online payment | Server only (the Key ID is passed to Razorpay Checkout at payment time) |
| `RAZORPAY_WEBHOOK_SECRET` | Payment webhook | Server only |

Secrets must never be prefixed with `VITE_` — that would ship them to the browser. Server modules are named `*.server.ts`; the build refuses to bundle them for the browser.

## 3. Database (Supabase)

1. Create a Supabase project (region: Mumbai `ap-south-1` is closest).
2. Open **SQL editor**, paste `supabase/schema.sql`, run it.
3. Copy **Project URL** → `SUPABASE_URL` and the **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (server env only).

Row-level security is enabled on every table with no public policies, so the public anon key cannot read orders or customer details — only the storefront server can.

> The Supabase store (`src/server/store/supabase.server.ts`) is implemented against PostgREST but has **not yet been run against a live project**. Place a test order after setup and check it appears in the `orders` and `order_items` tables and in `/admin`.

## 4. Admin

Set `ADMIN_PASSWORD` and `SESSION_SECRET`, deploy, then open `/admin`. You can:

- filter orders by status and move them through the allowed steps (pending → processing → shipped → delivered, cancel, refund);
- record cash collected for cash-on-delivery / pay-at-store orders;
- see wholesale enquiries and reply on WhatsApp;
- view the catalogue (read-only) and current store settings.

Online payments can only be marked **paid** by server-side Razorpay verification — never by hand. Product editing in the browser is not built yet (see `docs/CATALOGUE.md`).

## 5. Deployment

The project builds with `npm run build`. Lovable's config builds for **Cloudflare Workers** by default (via Nitro).

1. Set the environment variables above as **secrets** in your host (Cloudflare: Workers → Settings → Variables and Secrets, or `wrangler secret put NAME`). `VITE_SITE_URL` must be present at **build** time because it is compiled into the client.
2. Deploy (Lovable "Publish", or your own pipeline).
3. Visit `/sitemap.xml` and `/robots.txt` to confirm they show your domain.
4. Register the Razorpay webhook (see the production checklist).

> Environment access is written to work on both Node and Cloudflare Workers (`process.env` or Worker bindings). It has been exercised locally on Node only — confirm on your host by opening `/admin` (it should show the sign-in form once secrets are set) and placing a test order.
