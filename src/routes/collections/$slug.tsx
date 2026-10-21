import { createFileRoute, notFound } from "@tanstack/react-router";
import { CatalogView } from "@/components/catalog/CatalogView";
import { PageShell } from "@/components/layout/PageShell";
import { useSetCatalogSearch } from "@/hooks/use-catalog-search";
import { getCollection } from "@/lib/catalog";
import { validateCatalogSearch } from "@/lib/catalog/search-params";
import { breadcrumbJsonLd, seo } from "@/lib/seo";

export const Route = createFileRoute("/collections/$slug")({
  validateSearch: validateCatalogSearch,
  loader: ({ params }) => {
    const collection = getCollection(params.slug);
    if (!collection) throw notFound();
    return { collection };
  },
  head: ({ loaderData, params }) =>
    loaderData
      ? seo({
          title: `${loaderData.collection.title} — Shop`,
          description: `${loaderData.collection.description} Shop ${loaderData.collection.title.toLowerCase()} at DB Hub Cloth Store.`,
          path: `/collections/${params.slug}`,
          image: loaderData.collection.image,
          jsonLd: breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/shop" },
            { name: loaderData.collection.title, path: `/collections/${params.slug}` },
          ]),
        })
      : { meta: [{ title: "Collection not found | DB Hub Cloth Store" }] },
  component: CollectionPage,
});

function CollectionPage() {
  const { collection } = Route.useLoaderData();
  const search = Route.useSearch();
  const setSearch = useSetCatalogSearch(Route.useNavigate());
  return (
    <PageShell>
      <CatalogView
        key={collection.slug}
        title={collection.title}
        description={collection.description}
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Shop", to: "/shop" },
          { label: collection.title },
        ]}
        collection={collection}
        search={search}
        setSearch={setSearch}
      />
    </PageShell>
  );
}
