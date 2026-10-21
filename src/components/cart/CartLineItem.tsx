import { Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { ProductImage, QuantityStepper } from "@/components/product/parts";
import { useBag, type BagLine } from "@/hooks/use-bag";
import { categoryName, colourInStock, primaryImage, sizeInStock } from "@/lib/catalog";
import { formatINR } from "@/lib/money";
import { cn } from "@/lib/utils";

/** One bag line: thumbnail, variant switchers, quantity, price and remove. Used by the drawer and /cart. */
export function CartLineItem({
  line,
  onNavigate,
  large = false,
}: {
  line: BagLine;
  onNavigate?: () => void;
  large?: boolean;
}) {
  const { setQty, changeVariant, remove } = useBag();
  const p = line.product;
  const select =
    "h-8 min-w-0 border bg-background pl-2 pr-1 text-xs outline-none focus:border-primary";

  return (
    <li className="flex gap-4 py-5">
      <Link
        to="/products/$slug"
        params={{ slug: p.slug }}
        onClick={onNavigate}
        className="shrink-0"
      >
        <ProductImage
          src={primaryImage(p, line.colour)?.src}
          alt={p.name}
          className={cn("w-[84px]", large ? "h-[132px] sm:w-[99px]" : "h-28")}
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow truncate text-[0.55rem] text-muted-foreground">
              {categoryName(p.category)}
            </p>
            <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-snug">
              <Link
                to="/products/$slug"
                params={{ slug: p.slug }}
                onClick={onNavigate}
                className="hover:text-primary"
              >
                {p.name}
              </Link>
            </h3>
          </div>
          <div className="shrink-0 text-right tabular-nums">
            <p className="text-sm font-semibold">{formatINR(line.lineTotal)}</p>
            {p.compareAtPrice && p.compareAtPrice > p.price && (
              <s className="text-xs text-muted-foreground">
                {formatINR(p.compareAtPrice * line.qty)}
              </s>
            )}
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {p.sizes.length > 1 ? (
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              Size
              <select
                value={line.size}
                onChange={(e) => changeVariant(line.key, e.target.value, line.colour)}
                className={select}
                aria-label={`Size for ${p.name}`}
              >
                {p.sizes.map((s) => (
                  <option
                    key={s}
                    value={s}
                    disabled={s !== line.size && !sizeInStock(p, s, line.colour)}
                  >
                    {s}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <span className="text-xs text-muted-foreground">Size {line.size}</span>
          )}
          {p.colours.length > 1 ? (
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              Colour
              <select
                value={line.colour}
                onChange={(e) => changeVariant(line.key, line.size, e.target.value)}
                className={select}
                aria-label={`Colour for ${p.name}`}
              >
                {p.colours.map((c) => (
                  <option
                    key={c.name}
                    value={c.name}
                    disabled={c.name !== line.colour && !colourInStock(p, c.name, line.size)}
                  >
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <span className="text-xs text-muted-foreground">· {line.colour}</span>
          )}
        </div>

        {!line.available && (
          <p role="alert" className="mt-2 flex items-start gap-1.5 text-xs text-destructive">
            <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
            {line.maxQty === 0
              ? "This size has sold out — change the size or remove it."
              : `Only ${line.maxQty} available — reduce the quantity.`}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <QuantityStepper
            size="sm"
            label={`Quantity of ${p.name}`}
            value={line.qty}
            max={Math.max(1, line.maxQty)}
            onChange={(n) => setQty(line.key, n)}
          />
          <button
            type="button"
            onClick={() => remove(line.key)}
            aria-label={`Remove ${p.name}, size ${line.size}, ${line.colour}`}
            className="text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-primary"
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
