import { createFileRoute } from "@tanstack/react-router";
import { CatalogView } from "@/components/catalog/CatalogView";
import { PageShell } from "@/components/layout/PageShell";
import { useSetCatalogSearch } from "@/hooks/use-catalog-search";
import { validateCatalogSearch } from "@/lib/catalog/search-params";
import { breadcrumbJsonLd, seo } from "@/lib/seo";

export const Route = createFileRoute("/shop")({
  validateSearch: validateCatalogSearch,
  head: () =>
    seo({
      title: "Shop All Clothing",
      description:
        "Browse women's wear, unisex fashion, Korean-inspired styles and imported finds from DB Hub Cloth Store, Chennai & Coimbatore.",
      path: "/shop",
      jsonLd: breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Shop", path: "/shop" },
      ]),
    }),
  component: ShopPage,
});

function ShopPage() {
  const search = Route.useSearch();
  const setSearch = useSetCatalogSearch(Route.useNavigate());
  return (
    <PageShell>
      <CatalogView
        title="All clothing"
        description="Women's styles, unisex essentials, Korean fashion and imported finds — all in one place."
        crumbs={[{ label: "Home", to: "/" }, { label: "Shop" }]}
        search={search}
        setSearch={setSearch}
      />
    </PageShell>
  );
}
