import { useEffect, useState, type ReactNode } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ChevronDown, Info, ShoppingBag, Store, Truck } from "lucide-react";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container, PageShell } from "@/components/layout/PageShell";
import { ProductGrid } from "@/components/product/ProductCard";
import {
  ColourPicker,
  Price,
  ProductImage,
  QuantityStepper,
  SizePicker,
  WishlistButton,
} from "@/components/product/parts";
import { useProductSelection } from "@/components/product/use-product-selection";
import { SITE, STORES } from "@/config/site";
import {
  ACTIVE_PRODUCTS,
  TYPE_LABELS,
  categoryName,
  getProduct,
  imagesFor,
  isInStock,
  type Product,
} from "@/lib/catalog";
import { absoluteUrl, breadcrumbJsonLd, seo } from "@/lib/seo";
import { waLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/products/$slug")({
  // ?colour=Black opens the page on that colourway (used by product-card colour dots and shared links).
  validateSearch: (s: Record<string, unknown>): { colour?: string | undefined } => ({
    colour: typeof s["colour"] === "string" && s["colour"].length <= 40 ? s["colour"] : undefined,
  }),
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: `Product not found | ${SITE.name}` }] };
    const p = loaderData.product;
    const path = `/products/${params.slug}`;
    return seo({
      title: `${p.name} — ${categoryName(p.category)}`,
      description: `${p.shortDescription} ${p.demo ? "" : `Shop at ${SITE.name}.`}`.trim(),
      path,
      image: p.images[0]?.src,
      type: "product",
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
          { name: p.name, path },
        ]),
        // Structured product data only for real (non-demo) listings, so search engines never index placeholder offers.
        ...(p.demo
          ? []
          : [
              {
                "@context": "https://schema.org",
                "@type": "Product",
                name: p.name,
                description: p.description,
                image: p.images.map((i) => absoluteUrl(i.src)),
                sku: p.variants[0]?.sku,
                brand: { "@type": "Brand", name: SITE.shortName },
                offers: {
                  "@type": "Offer",
                  priceCurrency: "INR",
                  price: p.price,
                  url: absoluteUrl(path),
                  availability: isInStock(p)
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
                },
              },
            ]),
      ],
    });
  },
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { colour } = Route.useSearch();
  return (
    <PageShell>
      {/* Keyed so selection state resets when moving between products. */}
      <ProductDetail key={product.id} product={product} initialColour={colour} />
    </PageShell>
  );
}

function ProductDetail({
  product,
  initialColour,
}: {
  product: Product;
  initialColour?: string | undefined;
}) {
  const s = useProductSelection(product, initialColour);
  const setUrl = Route.useNavigate();
  // Keep the chosen colour in the address so a shared link opens on the same colourway.
  const chooseColour = (c: string) => {
    s.setColour(c);
    void setUrl({ search: { colour: c }, replace: true, resetScroll: false });
  };
  const navigate = useNavigate();
  // The gallery follows the selected colour; the picked thumbnail resets when the colour changes.
  const gallery = imagesFor(product, s.colour);
  const [pick, setPick] = useState<{ colour: string | null; index: number }>({
    colour: s.colour,
    index: 0,
  });
  const image = pick.colour === s.colour ? Math.min(pick.index, gallery.images.length - 1) : 0;
  const current = gallery.images[image];
  const [origin, setOrigin] = useState(SITE.url);
  useEffect(() => {
    if (!SITE.url) setOrigin(window.location.origin);
  }, []);
  const productUrl = origin ? `${origin}/products/${product.slug}` : undefined;
  const related = ACTIVE_PRODUCTS.filter(
    (p) => p.id !== product.id && (p.category === product.category || p.type === product.type),
  ).slice(0, 4);
  const details = [
    ["Category", categoryName(product.category)],
    ["Type", TYPE_LABELS[product.type]],
    ...(product.fabric ? [["Fabric", product.fabric]] : []),
    ...(product.fit ? [["Fit", product.fit]] : []),
    ...(product.care ? [["Care", product.care]] : []),
    ...(s.variant ? [["SKU", s.variant.sku]] : []),
  ] as [string, string][];

  return (
    <>
      <Container className="pt-6 lg:pt-8">
        <Breadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: "Shop", to: "/shop" },
            {
              label: categoryName(product.category),
              to: "/collections/$slug",
              params: { slug: product.category },
            },
            { label: product.name },
          ]}
        />
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          {/* Gallery */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="relative overflow-hidden bg-muted">
              {/* Keyed by photo so switching colour cross-fades to the new image. */}
              <ProductImage
                key={current?.src}
                src={current?.src}
                alt={current?.alt ?? product.name}
                eager
                className="aspect-[3/4] w-full animate-in fade-in-0 duration-500"
              />
              {!gallery.exact && s.colour && (
                <p className="absolute inset-x-3 bottom-3 rounded-md bg-background/90 px-3 py-2 text-xs shadow-sm">
                  Photo shows {gallery.shownColour}. {s.colour} photo coming soon —{" "}
                  <a
                    href={waLink(
                      `Hello DB Hub! Could you share a photo of the ${product.name} in ${s.colour}?`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    ask us for one
                  </a>
                  .
                </p>
              )}
            </div>
            {gallery.images.length > 1 && (
              <div className="mt-3 flex gap-2" role="group" aria-label="Product images">
                {gallery.images.map((img, i) => (
                  <button
                    key={img.src}
                    type="button"
                    onClick={() => setPick({ colour: s.colour, index: i })}
                    aria-label={`Show image ${i + 1}`}
                    aria-pressed={i === image}
                    className={`w-20 border-2 ${i === image ? "border-primary" : "border-transparent"}`}
                  >
                    <ProductImage src={img.src} alt="" className="aspect-[3/4] w-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Purchase panel */}
          <div className="flex flex-col gap-6 pb-4">
            <div>
              <Link
                to="/collections/$slug"
                params={{ slug: product.category }}
                className="eyebrow text-[0.65rem] text-primary hover:underline"
              >
                {categoryName(product.category)}
              </Link>
              <h1 className="display mt-2 text-4xl sm:text-5xl">{product.name}</h1>
              <Price
                price={product.price}
                compareAt={product.compareAtPrice}
                size="lg"
                className="mt-4"
              />
              <p className="mt-1 text-xs text-muted-foreground">Prices in Indian Rupees (INR)</p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {product.shortDescription}
              </p>
              {product.demo && (
                <p className="mt-4 flex gap-2 rounded-lg bg-secondary/70 p-3 text-xs leading-relaxed text-muted-foreground">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  This is an illustrative demo listing. Stock and pricing are placeholders — please
                  confirm availability with our team.
                </p>
              )}
            </div>

            <ColourPicker
              product={product}
              value={s.colour}
              onChange={chooseColour}
              size={s.size}
            />
            <div>
              <SizePicker
                product={product}
                value={s.size}
                onChange={s.setSize}
                colour={s.colour}
                error={s.error}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Measurements not listed yet —{" "}
                <a
                  href={waLink(
                    `Hello DB Hub! Could you share the measurements / size guide for ${product.name}?${productUrl ? `\n${productUrl}` : ""}`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-primary"
                >
                  ask us on WhatsApp
                </a>{" "}
                for a size guide.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <QuantityStepper value={s.qty} onChange={s.setQty} max={s.maxQty} />
              <StockNote
                product={product}
                stock={s.variant?.stock}
                size={s.size}
                colour={s.colour}
              />
            </div>

            <div className="grid gap-3">
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={s.soldOut}
                  onClick={() => s.add()}
                  className="btn-primary flex-1 justify-center rounded-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {s.soldOut ? "Sold out" : "Add to bag"}
                </button>
                <WishlistButton
                  product={product}
                  className="h-[3.05rem] w-[3.05rem] shrink-0 rounded-lg border bg-background shadow-none"
                />
              </div>
              {!s.soldOut && (
                <button
                  type="button"
                  onClick={() => {
                    if (s.add()) void navigate({ to: "/checkout" });
                  }}
                  className="btn-outline justify-center rounded-lg"
                >
                  Buy now
                </button>
              )}
              <WhatsAppButton
                variant="outline"
                message={s.whatsappText(productUrl)}
                className="rounded-lg border-[#1f7a4d] text-[#1f7a4d] hover:bg-[#1f7a4d] hover:text-white"
              >
                Order on WhatsApp
              </WhatsAppButton>
            </div>

            <div className="divide-y border-y">
              <Accordion title="Description" open>
                <p className="leading-relaxed">{product.description}</p>
              </Accordion>
              <Accordion title="Product details">
                <dl className="grid grid-cols-[7rem_1fr] gap-y-2 text-sm">
                  {details.flatMap(([k, v]) => [
                    <dt key={`${k}-t`} className="text-muted-foreground">
                      {k}
                    </dt>,
                    <dd key={`${k}-d`} className="text-foreground">
                      {v}
                    </dd>,
                  ])}
                </dl>
              </Accordion>
              <Accordion title="Shipping & pickup">
                <ul className="space-y-3 text-sm leading-relaxed">
                  <li className="flex gap-3">
                    <Truck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    Home delivery across India. Delivery charges and timelines are confirmed by our
                    team when you order.
                  </li>
                  <li className="flex gap-3">
                    <Store className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    Free pickup from our {STORES.map((x) => x.city).join(" and ")} stores.
                  </li>
                </ul>
                <Link
                  to="/policies/shipping"
                  className="mt-3 inline-block text-sm underline underline-offset-4 hover:text-primary"
                >
                  Shipping policy
                </Link>
              </Accordion>
              <Accordion title="Returns & exchanges">
                <p className="text-sm leading-relaxed">
                  Returns and exchanges follow our returns policy. Please keep tags attached and
                  contact us before sending anything back.
                </p>
                <Link
                  to="/policies/returns"
                  className="mt-3 inline-block text-sm underline underline-offset-4 hover:text-primary"
                >
                  Returns & refunds policy
                </Link>
              </Accordion>
            </div>
          </div>
        </div>
      </Container>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="mt-20 border-t bg-card py-16">
          <Container>
            <h2 id="related-title" className="display text-4xl">
              You may also like
            </h2>
            <ProductGrid products={related} className="mt-8 lg:grid-cols-4" />
          </Container>
        </section>
      )}
      <div className="h-16" />
    </>
  );
}

function StockNote({
  product,
  stock,
  size,
  colour,
}: {
  product: Product;
  stock: number | undefined;
  size: string | null;
  colour: string | null;
}) {
  if (!product.variants.some((v) => v.stock > 0))
    return <p className="text-sm font-medium text-destructive">Sold out</p>;
  if (!size || !colour)
    return <p className="text-sm text-muted-foreground">Select a size to check stock</p>;
  if (!stock)
    return (
      <p className="text-sm font-medium text-destructive">
        Sold out in {colour}, size {size}
      </p>
    );
  if (stock <= 3) return <p className="text-sm font-medium text-primary">Only {stock} left</p>;
  return <p className="text-sm text-[#1f7a4d]">In stock</p>;
}

function Accordion({
  title,
  children,
  open = false,
}: {
  title: string;
  children: ReactNode;
  open?: boolean;
}) {
  return (
    <details open={open} className="group">
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
      </summary>
      <div className="pb-5 text-muted-foreground">{children}</div>
    </details>
  );
}
