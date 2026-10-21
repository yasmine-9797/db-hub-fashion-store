import { createFileRoute } from "@tanstack/react-router";
import { SITE } from "@/config/site";
import { ACTIVE_PRODUCTS, COLLECTIONS } from "@/lib/catalog";

const STATIC_PATHS = [
  "/",
  "/shop",
  "/wholesale",
  "/about",
  "/contact",
  "/faq",
  "/policies/shipping",
  "/policies/returns",
  "/policies/privacy",
  "/policies/terms",
];

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** XML sitemap generated from the live catalogue. Uses VITE_SITE_URL, else the request origin. */
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const origin = SITE.url || new URL(request.url).origin;
        const urls = [
          ...STATIC_PATHS.map((p) => ({ loc: p })),
          ...COLLECTIONS.map((c) => ({ loc: `/collections/${c.slug}` })),
          ...ACTIVE_PRODUCTS.map((p) => ({ loc: `/products/${p.slug}`, lastmod: p.addedAt })),
        ];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${escape(origin + u.loc)}</loc>${"lastmod" in u && u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}</url>`).join("\n")}
</urlset>`;
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
