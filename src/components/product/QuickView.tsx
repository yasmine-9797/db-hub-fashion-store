import { Link } from "@tanstack/react-router";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowRight, ShoppingBag, X } from "lucide-react";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import {
  ColourPicker,
  Price,
  ProductImage,
  QuantityStepper,
  SizePicker,
  WishlistButton,
} from "@/components/product/parts";
import { useProductSelection } from "@/components/product/use-product-selection";
import { categoryName, primaryImage, type Product } from "@/lib/catalog";

/** Quick view: choose a variant and add to bag without leaving the listing. */
export function QuickView({
  product,
  onClose,
  initialColour,
}: {
  product: Product;
  onClose: () => void;
  initialColour?: string | null;
}) {
  const s = useProductSelection(product, initialColour);
  const photo = primaryImage(product, s.colour);
  return (
    <DialogPrimitive.Root open onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 overflow-hidden rounded-t-2xl bg-background shadow-2xl data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[min(56rem,calc(100vw-3rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-none sm:data-[state=open]:zoom-in-95 sm:data-[state=open]:slide-in-from-bottom-0"
        >
          <DialogPrimitive.Close
            aria-label="Close"
            className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-background/90 shadow-md hover:bg-background"
          >
            <X className="h-5 w-5" />
          </DialogPrimitive.Close>
          <div className="thin-scroll grid max-h-[92dvh] overflow-y-auto sm:max-h-[88dvh] sm:grid-cols-2">
            {/* Follows the selected colour; keyed so the swap cross-fades. */}
            <ProductImage
              key={photo?.src}
              src={photo?.src}
              alt={photo?.alt ?? product.name}
              eager
              className="h-[42dvh] w-full animate-in fade-in-0 duration-500 sm:aspect-[3/4] sm:h-full"
            />
            <div className="flex flex-col gap-5 p-6 sm:p-8">
              <div>
                <p className="eyebrow text-[0.65rem] text-primary">
                  {categoryName(product.category)}
                </p>
                <DialogPrimitive.Title className="display mt-2 text-3xl sm:text-4xl">
                  {product.name}
                </DialogPrimitive.Title>
                <Price
                  price={product.price}
                  compareAt={product.compareAtPrice}
                  size="lg"
                  className="mt-3"
                />
                {product.demo && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Illustrative demo listing — confirm availability with us.
                  </p>
                )}
              </div>
              <ColourPicker
                product={product}
                value={s.colour}
                onChange={s.setColour}
                size={s.size}
              />
              <SizePicker
                product={product}
                value={s.size}
                onChange={s.setSize}
                colour={s.colour}
                error={s.error}
              />
              <div className="flex items-center gap-3">
                <QuantityStepper value={s.qty} onChange={s.setQty} max={s.maxQty} />
                {s.variant && s.variant.stock > 0 && s.variant.stock <= 3 && (
                  <p className="text-sm text-primary">Only {s.variant.stock} left</p>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={s.soldOut}
                    onClick={() => {
                      if (s.add()) onClose();
                    }}
                    className="btn-primary flex-1 justify-center rounded-lg disabled:opacity-50"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    {s.soldOut ? "Sold out" : "Add to bag"}
                  </button>
                  <WishlistButton
                    product={product}
                    className="h-[3.05rem] w-[3.05rem] shrink-0 rounded-lg border bg-background shadow-none"
                  />
                </div>
                <WhatsAppButton variant="outline" message={s.whatsappText()} className="rounded-lg">
                  Order on WhatsApp
                </WhatsAppButton>
              </div>
              <Link
                to="/products/$slug"
                params={{ slug: product.slug }}
                onClick={onClose}
                className="inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:text-primary hover:underline"
              >
                View full details <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
