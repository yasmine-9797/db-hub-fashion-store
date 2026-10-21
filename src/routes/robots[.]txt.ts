import { createFileRoute } from "@tanstack/react-router";
import { SITE } from "@/config/site";

/** robots.txt: crawl the storefront, skip private flows, point to the sitemap. */
export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const origin = SITE.url || new URL(request.url).origin;
        const body = [
          "User-agent: *",
          "Allow: /",
          "Disallow: /admin",
          "Disallow: /checkout",
          "Disallow: /cart",
          "Disallow: /order/",
          "Disallow: /payment-status",
          "Disallow: /api/",
          "",
          `Sitemap: ${origin}/sitemap.xml`,
          "",
        ].join("\n");
        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
