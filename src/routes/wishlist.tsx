import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container, PageShell } from "@/components/layout/PageShell";
import { ProductGrid } from "@/components/product/ProductCard";
import { useSaved } from "@/hooks/use-saved";
import { getProductById, type Product } from "@/lib/catalog";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/wishlist")({
  head: () =>
    seo({
      title: "Wishlist",
      description: "Pieces you've saved at DB Hub Cloth Store.",
      path: "/wishlist",
      noindex: true,
    }),
  component: WishlistPage,
});

function WishlistPage() {
  const { ids, ready } = useSaved();
  const products = ids.map(getProductById).filter((p): p is Product => Boolean(p));
  return (
    <PageShell>
      <Container className="pb-24 pt-8 lg:pt-10">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Wishlist" }]} />
        <h1 className="display mt-5 text-5xl sm:text-6xl">Wishlist</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Saved on this device.{" "}
          {products.length > 0 &&
            `${products.length} ${products.length === 1 ? "piece" : "pieces"}.`}
        </p>
        <div className="mt-10">
          {!ready ? (
            <div className="h-64" aria-busy="true" />
          ) : products.length === 0 ? (
            <div className="border border-dashed px-6 py-20 text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-secondary">
                <Heart className="h-7 w-7 text-primary" strokeWidth={1.5} />
              </span>
              <p className="display mt-5 text-3xl">Nothing saved yet</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Tap the heart on any product to keep it here for later.
              </p>
              <Link to="/shop" className="btn-primary mt-7">
                Browse the shop
              </Link>
            </div>
          ) : (
            <ProductGrid products={products} className="lg:grid-cols-4" />
          )}
        </div>
      </Container>
    </PageShell>
  );
}
