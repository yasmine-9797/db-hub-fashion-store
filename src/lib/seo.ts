import { SITE } from "@/config/site";
import logo from "@/assets/logo.png";

const absolute = (path: string) =>
  SITE.url ? `${SITE.url}${path.startsWith("/") ? path : `/${path}`}` : path;

/**
 * Head tags for a page: unique title/description, Open Graph, Twitter and a canonical URL.
 * Canonical/og:url need an absolute origin, so they are emitted only when VITE_SITE_URL is set.
 */
export function seo({
  title,
  description = SITE.description,
  path,
  image,
  type = "website",
  noindex = false,
  jsonLd,
}: {
  title: string;
  description?: string;
  path: string;
  image?: string | undefined;
  type?: "website" | "product" | "article";
  noindex?: boolean;
  jsonLd?: object | object[];
}) {
  const fullTitle = title.includes(SITE.name) ? title : `${title} | ${SITE.name}`;
  const img = absolute(image ?? logo);
  return {
    meta: [
      { title: fullTitle },
      { name: "description", content: description },
      ...(noindex ? [{ name: "robots", content: "noindex, nofollow" }] : []),
      { property: "og:site_name", content: SITE.name },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: description },
      { property: "og:type", content: type },
      { property: "og:locale", content: SITE.locale },
      { property: "og:image", content: img },
      ...(SITE.url ? [{ property: "og:url", content: absolute(path) }] : []),
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: img },
    ],
    links: SITE.url ? [{ rel: "canonical", href: absolute(path) }] : [],
    scripts: (Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : []).map((data) => ({
      type: "application/ld+json",
      children: JSON.stringify(data),
    })),
  };
}

export const breadcrumbJsonLd = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    item: absolute(it.path),
  })),
});

export const absoluteUrl = absolute;
