# Production checklist

## A. Enable online payments (Razorpay)

How it works: the browser never sends prices. When a customer pays online, the server recalculates the order from the catalogue, creates a Razorpay order for that exact amount, and opens Razorpay Checkout (card/UPI details are entered only in Razorpay's window). Afterwards the server verifies the payment **signature** with your key secret and fetches the payment from Razorpay to confirm the **order id, amount, currency and captured status** before marking the order paid. A signed webhook covers customers who close the browser mid-payment.

1. **Razorpay account**: complete KYC for DB Hub in the Razorpay Dashboard.
2. **Test keys**: Dashboard → *Account & Settings → API Keys* → generate **test** keys. Set `RAZORPAY_KEY_ID` (`rzp_test_…`) and `RAZORPAY_KEY_SECRET` as server secrets.
3. **Auto-capture**: Dashboard → *Account & Settings → Payment capture* → automatic capture. (Orders are marked paid only once a payment is *captured*; authorised-only payments wait for the webhook.)
4. **Webhook**: Dashboard → *Webhooks → Add* → URL `https://<your-domain>/api/razorpay-webhook`, events **payment.captured**, **payment.failed**, **order.paid**, and a secret → set `RAZORPAY_WEBHOOK_SECRET` to the same value.
5. **Delivery charge**: online payment for **home delivery** is only offered once a delivery fee is configured (`SHIPPING.flatFee` in `src/config/site.ts`), so the charged amount is never missing delivery. Until then, online payment is offered for store pickup.
6. **Order storage**: Supabase must be configured (see SETUP.md) — online orders need somewhere to be recorded.
7. **Test end to end** with Razorpay test cards/UPI: success, failure, closing the window, retry from the payment-status page, and a webhook delivery (Dashboard shows delivery logs). Confirm `/admin` shows the order as **Paid** only after success.
8. **Go live**: generate **live** keys, replace the test keys and webhook secret, redeploy, and make a small real payment you then refund.

Refunds: issue them in the Razorpay Dashboard, then mark the order **Refunded** in `/admin`.

## B. Everything that still needs credentials or owner input

| Item | Status / action |
| --- | --- |
| Razorpay keys + webhook secret | Not provided — online payment shows "being set up" |
| Supabase project | Not provided — production orders/enquiries can't be saved; checkout falls back to WhatsApp |
| `ADMIN_PASSWORD`, `SESSION_SECRET` | Not set — `/admin` stays locked |
| `VITE_SITE_URL` (domain) | Not set — canonical URLs and absolute OG images are omitted |
| Real products, prices, stock and photos | Demo data — replace per `docs/CATALOGUE.md` |
| Policies (shipping, returns, privacy, terms) | Drafts with `[To be confirmed …]` placeholders — set `POLICIES_APPROVED = true` in `src/config/site.ts` after review |
| Delivery charge / free-delivery threshold | Not set — confirmed per order |
| WhatsApp number | Using +91 93459 26694 (`CONTACT.whatsapp`) as specified — confirm it is WhatsApp-enabled |
| Store opening hours, business email | Not provided — intentionally not shown |
| Product size guides | Not provided — customers are invited to ask on WhatsApp |
| Lookbook / Instagram imagery | Illustrative placeholders — replace with approved DB Hub photography |
| Wholesale pricing rules / minimums | Not provided — enquiries are handled by the team |
| Inventory reservation | Stock is checked at checkout but not decremented (catalogue is in code) — see `docs/CATALOGUE.md` |

## C. Verified vs. not yet verified

Verified in this repository (local Node dev server and `npm test`):
- catalogue validation, search, filters, sorting; pricing; WhatsApp message encoding and number;
- server-side order creation from catalogue prices, stock limits, duplicate-submission handling, payment-method rules, private order links;
- Razorpay signature verification, amount/currency checks, authorised-vs-captured handling, webhook signature checks, retry after failure — **against a mocked Razorpay API**;
- page rendering, navigation, responsive layouts (17 pages × 5 widths, 320–1366 px, no horizontal overflow) and browser flows in headless Edge: filters, search, product variants and stock limits, bag, checkout → order confirmation (cash on delivery, pay at store), the WhatsApp checkout path, wholesale enquiries, wishlist;
- admin with test credentials: sign-in/out, wrong password rejected, HTTP-only SameSite=Strict session cookie, allowed status changes only, cash collected, enquiries — and admin server functions refuse to run without a session.

Not verified (needs real credentials):
- live calls to Razorpay (test or live mode) and webhook delivery from Razorpay;
- the Supabase store against a real project;
- environment-variable access on the production host (Cloudflare Workers).
