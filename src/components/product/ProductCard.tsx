import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Eye, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Price, ProductImage, WishlistButton } from "@/components/product/parts";
import { QuickView } from "@/components/product/QuickView";
import { useBag } from "@/hooks/use-bag";
import { categoryName, discountPct, isInStock, primaryImage, type Product } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/** Listing card: image → product page, wishlist, quick view and add to bag. */
export function ProductCard({
  product,
  eager = false,
  colour: initialColour,
}: {
  product: Product;
  eager?: boolean;
  colour?: string | undefined;
}) {
  const [quick, setQuick] = useState(false);
  const bag = useBag();
  // Tapping a colour dot previews that colourway here and carries it to quick view / the product page.
  const [colour, setColour] = useState<string | null>(
    initialColour &&
      product.colours.length > 1 &&
      product.colours.some((c) => c.name === initialColour)
      ? initialColour
      : null,
  );
  const photo = primaryImage(product, colour);
  const off = discountPct(product);
  const inStock = isInStock(product);
  const available = product.variants.filter((v) => v.stock > 0);

  // One possible choice? Add straight away; otherwise open quick view to pick size/colour.
  const addOrChoose = () => {
    const only = available.length === 1 ? available[0] : undefined;
    if (!only) return setQuick(true);
    const r = bag.add(product.id, only.size, only.colour);
    if (r.ok)
      toast.success("Added to bag", {
        description: product.name,
        action: { label: "View bag", onClick: () => bag.setOpen(true) },
      });
    else
      toast.error(
        r.reason === "limit"
          ? "You already have the most available in your bag."
          : "This item is sold out.",
      );
  };

  return (
    <article className="group relative flex flex-col">
      <div className="relative overflow-hidden bg-muted">
        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
          search={{ colour: colour ?? undefined }}
          aria-label={colour ? `${product.name} in ${colour}` : product.name}
          className="block"
        >
          <ProductImage
            key={photo?.src}
            src={photo?.src}
            alt={photo?.alt ?? product.name}
            eager={eager}
            className={cn(
              "aspect-[3/4] w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]",
              colour && "animate-in fade-in-0 duration-500",
              !inStock && "opacity-60",
            )}
          />
        </Link>
        <div className="pointer-events-none absolute left-0 top-0 flex flex-col items-start gap-1">
          {!inStock && (
            <span className="eyebrow bg-ink px-2.5 py-1.5 text-[0.58rem] text-background">
              Sold out
            </span>
          )}
          {inStock && product.newArrival && (
            <span className="eyebrow bg-background px-2.5 py-1.5 text-[0.58rem] text-primary">
              New
            </span>
          )}
          {inStock && off > 0 && (
            <span className="eyebrow bg-primary px-2.5 py-1.5 text-[0.58rem] text-primary-foreground">
              {off}% off
            </span>
          )}
        </div>
        <WishlistButton product={product} className="absolute right-2.5 top-2.5" />
        {/* Desktop hover actions; on touch screens the buttons below the image do the same job. */}
        <div className="absolute inset-x-2.5 bottom-2.5 hidden translate-y-2 gap-2 opacity-0 transition duration-300 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 [@media(hover:hover)]:flex">
          <button
            type="button"
            onClick={() => setQuick(true)}
            className="flex flex-1 items-center justify-center gap-1.5 bg-background/95 py-2.5 text-xs font-semibold uppercase tracking-wider shadow hover:bg-background"
          >
            <Eye className="h-3.5 w-3.5" />
            Quick view
          </button>
          {inStock && (
            <button
              type="button"
              onClick={addOrChoose}
              className="flex flex-1 items-center justify-center gap-1.5 bg-primary py-2.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground shadow hover:bg-primary-deep"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Add
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-1 flex-col">
        <p className="eyebrow truncate text-[0.58rem] text-muted-foreground">
          {categoryName(product.category)}
        </p>
        <h3 className="mt-1 text-[0.95rem] font-medium leading-snug">
          <Link to="/products/$slug" params={{ slug: product.slug }} className="hover:text-primary">
            {product.name}
          </Link>
        </h3>
        <Price price={product.price} compareAt={product.compareAtPrice} className="mt-1.5" />
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          {product.colours.length > 1 ? (
            <span role="group" aria-label="Preview colour" className="flex gap-1">
              {product.colours.map((c) => {
                const on = (colour ?? product.colours[0]?.name) === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setColour(c.name)}
                    aria-pressed={on}
                    aria-label={`Show ${product.name} in ${c.name}`}
                    title={c.name}
                    className={cn(
                      "grid h-6 w-6 place-items-center rounded-full border transition-colors",
                      on ? "border-foreground" : "border-transparent hover:border-border",
                    )}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full ring-1 ring-border"
                      style={{ backgroundColor: c.hex }}
                    />
                  </button>
                );
              })}
            </span>
          ) : (
            <span
              title={product.colours[0]?.name}
              aria-label={`Colour: ${product.colours[0]?.name}`}
              className="h-3.5 w-3.5 rounded-full ring-1 ring-border"
              style={{ backgroundColor: product.colours[0]?.hex }}
            />
          )}
          <span className="truncate">{product.sizes.join(" · ")}</span>
        </div>
        <button
          type="button"
          onClick={inStock ? addOrChoose : () => setQuick(true)}
          className="mt-3 border py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground [@media(hover:hover)]:hidden"
        >
          {inStock ? "Add to bag" : "View details"}
        </button>
      </div>
      {quick && (
        <QuickView product={product} initialColour={colour} onClose={() => setQuick(false)} />
      )}
    </article>
  );
}

export function ProductGrid({
  products,
  eagerCount = 0,
  className,
  colour,
}: {
  products: Product[];
  eagerCount?: number;
  className?: string;
  /** When the list is filtered by colour, cards open on that colourway. */
  colour?: string | undefined;
}) {
  return (
    <ul className={cn("grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-6", className)}>
      {products.map((p, i) => (
        <li key={p.id}>
          <ProductCard key={colour ?? ""} product={p} eager={i < eagerCount} colour={colour} />
        </li>
      ))}
    </ul>
  );
}
