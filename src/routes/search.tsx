import { createFileRoute } from "@tanstack/react-router";
import { CatalogView } from "@/components/catalog/CatalogView";
import { PageShell } from "@/components/layout/PageShell";
import { useSetCatalogSearch } from "@/hooks/use-catalog-search";
import { validateCatalogSearch } from "@/lib/catalog/search-params";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/search")({
  validateSearch: validateCatalogSearch,
  head: ({ match }) =>
    seo({
      title: match.search.q ? `Search: ${match.search.q}` : "Search",
      description: "Search DB Hub Cloth Store by product name, category or colour.",
      path: "/search",
      noindex: true,
    }),
  component: SearchPage,
});

function SearchPage() {
  const search = Route.useSearch();
  const setSearch = useSetCatalogSearch(Route.useNavigate());
  return (
    <PageShell>
      <CatalogView
        title={search.q ? `Results for “${search.q}”` : "Search"}
        description={
          search.q
            ? undefined
            : "Type a product name, category or colour — for example “dress”, “Korean” or “black”."
        }
        crumbs={[{ label: "Home", to: "/" }, { label: "Search" }]}
        search={search}
        setSearch={setSearch}
        chips={false}
      />
    </PageShell>
  );
}
