import { useState } from "react";
import { Heart, Minus, Plus } from "lucide-react";
import { useSaved } from "@/hooks/use-saved";
import { colourInStock, sizeInStock, type Product } from "@/lib/catalog";
import { formatINR } from "@/lib/money";
import { cn } from "@/lib/utils";

/** Selling price, optional struck-through MRP and percentage saved. */
export function Price({
  price,
  compareAt,
  size = "sm",
  className,
}: {
  price: number;
  compareAt?: number | undefined;
  size?: "sm" | "lg";
  className?: string;
}) {
  const off =
    compareAt && compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0;
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2 tabular-nums", className)}>
      <span className={size === "lg" ? "text-2xl font-semibold" : "text-sm font-semibold"}>
        {formatINR(price)}
      </span>
      {off > 0 && (
        <>
          <s className={cn("text-muted-foreground", size === "lg" ? "text-base" : "text-xs")}>
            <span className="sr-only">Original price </span>
            {formatINR(compareAt!)}
          </s>
          <span className={cn("font-medium text-primary", size === "lg" ? "text-sm" : "text-xs")}>
            {off}% off
          </span>
        </>
      )}
    </p>
  );
}

/** Product photo with a branded placeholder if the file fails to load. */
export function ProductImage({
  src,
  alt,
  className,
  eager = false,
}: {
  src: string | undefined;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn("grid place-items-center bg-muted text-muted-foreground", className)}
      >
        <span className="display text-2xl text-primary/40">DB Hub</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      width={768}
      height={1024}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
      className={cn("bg-muted object-cover", className)}
    />
  );
}

export function WishlistButton({ product, className }: { product: Product; className?: string }) {
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(product.id);
  return (
    <button
      type="button"
      onClick={() => toggle(product.id)}
      aria-pressed={saved}
      aria-label={
        saved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`
      }
      className={cn(
        "grid h-10 w-10 place-items-center rounded-full bg-background/95 shadow-sm transition-transform hover:scale-105",
        className,
      )}
    >
      <Heart
        key={String(saved)}
        className={cn("h-4 w-4", saved && "bag-pop fill-primary text-primary")}
      />
    </button>
  );
}

export function ColourPicker({
  product,
  value,
  onChange,
  size,
}: {
  product: Product;
  value: string | null;
  onChange: (colour: string) => void;
  size: string | null;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium">
        Colour{value && <span className="ml-1.5 font-normal text-muted-foreground">{value}</span>}
      </legend>
      <div className="mt-2.5 flex flex-wrap gap-2.5">
        {product.colours.map((c) => {
          const available = colourInStock(product, c.name, size ?? undefined);
          const selected = value === c.name;
          return (
            <button
              key={c.name}
              type="button"
              onClick={() => onChange(c.name)}
              aria-pressed={selected}
              aria-label={`${c.name}${available ? "" : " (sold out in this size)"}`}
              title={c.name}
              className={cn(
                "relative grid h-10 w-10 place-items-center rounded-full border-2 transition",
                selected ? "border-primary" : "border-transparent hover:border-border",
              )}
            >
              <span
                className="h-7 w-7 rounded-full border border-black/10"
                style={{ backgroundColor: c.hex }}
              />
              {!available && (
                <span
                  aria-hidden="true"
                  className="absolute h-[2px] w-9 rotate-45 bg-foreground/60"
                />
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function SizePicker({
  product,
  value,
  onChange,
  colour,
  error,
}: {
  product: Product;
  value: string | null;
  onChange: (size: string) => void;
  colour: string | null;
  error?: string | undefined;
}) {
  return (
    <fieldset aria-describedby={error ? "size-error" : undefined}>
      <legend className="text-sm font-medium">Size</legend>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {product.sizes.map((s) => {
          const available = sizeInStock(product, s, colour ?? undefined);
          const selected = value === s;
          return (
            <button
              key={s}
              type="button"
              disabled={!available}
              onClick={() => onChange(s)}
              aria-pressed={selected}
              aria-label={
                available ? `Size ${s}` : `Size ${s}, sold out${colour ? ` in ${colour}` : ""}`
              }
              className={cn(
                "min-h-11 min-w-12 border px-3 text-sm transition-colors",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:border-foreground",
                !available &&
                  "cursor-not-allowed text-muted-foreground line-through decoration-1 opacity-60 hover:border-border",
              )}
            >
              {s}
            </button>
          );
        })}
      </div>
      {error && (
        <p id="size-error" role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  );
}

export function QuantityStepper({
  value,
  onChange,
  max,
  label = "Quantity",
  size = "md",
}: {
  value: number;
  onChange: (n: number) => void;
  max: number;
  label?: string;
  size?: "sm" | "md";
}) {
  const btn = cn(
    "grid place-items-center transition-colors hover:bg-secondary disabled:opacity-30 disabled:hover:bg-transparent",
    size === "sm" ? "h-8 w-8" : "h-11 w-11",
  );
  return (
    <div role="group" aria-label={label} className="inline-flex items-center border bg-background">
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="Decrease quantity"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span
        aria-live="polite"
        className={cn(
          "text-center font-medium tabular-nums",
          size === "sm" ? "w-7 text-xs" : "w-10 text-sm",
        )}
      >
        <span className="sr-only">Quantity </span>
        {value}
      </span>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
