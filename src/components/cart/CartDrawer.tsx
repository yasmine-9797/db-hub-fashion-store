import { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Info, ShoppingBag, X } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { useBag } from "@/hooks/use-bag";
import { formatINR } from "@/lib/money";
import { cartMessage, wholesaleMessage } from "@/lib/whatsapp";

/** Site-wide bag drawer, opened from the header or after adding a product. */
export function CartDrawer() {
  const { lines, count, subtotal, mrpTotal, hasUnavailable, open, setOpen } = useBag();
  const navigate = useNavigate();
  const savings = mrpTotal - subtotal;
  const itemsLabel = `${count} ${count === 1 ? "item" : "items"}`;
  // Runs once the drawer has fully closed (and released its scroll lock) — e.g. navigate somewhere.
  const afterClose = useRef<(() => void) | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (open) returnFocus.current = document.activeElement as HTMLElement | null;
  }, [open]);
  const closeThen = (fn: () => void) => {
    afterClose.current = fn;
    setOpen(false);
  };

  const message = cartMessage(
    lines.map((l) => ({
      name: l.product.name,
      sku: l.variant?.sku,
      size: l.size,
      colour: l.colour,
      qty: l.qty,
      lineTotal: l.lineTotal,
    })),
    subtotal,
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        hideClose
        overlayClassName="bg-ink/40 backdrop-blur-[2px]"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-[440px]"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          const fn = afterClose.current;
          afterClose.current = null;
          if (fn) fn();
          else returnFocus.current?.focus?.();
        }}
      >
        <header className="flex shrink-0 items-center justify-between border-b px-6 py-5 [@media(max-height:32rem)]:py-3">
          <div className="flex items-baseline gap-3">
            <SheetTitle className="display text-[1.85rem] font-semibold">Your bag</SheetTitle>
            <SheetDescription className="eyebrow text-[0.6rem] text-muted-foreground">
              {count ? itemsLabel : "Empty"}
            </SheetDescription>
          </div>
          <SheetClose
            aria-label="Close bag"
            className="-mr-2 grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </SheetClose>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-secondary">
              <ShoppingBag className="h-7 w-7 text-primary" strokeWidth={1.5} />
            </span>
            <p className="display mt-5 text-3xl">Your bag is empty</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Your next favourite outfit is waiting.
            </p>
            <button
              onClick={() => closeThen(() => void navigate({ to: "/shop" }))}
              className="btn-primary mt-7 rounded-lg"
            >
              Shop the collection <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Items and the price breakdown scroll together so short screens still show the items. */}
            <div className="thin-scroll min-h-0 flex-1 overflow-y-auto">
              <ul className="divide-y px-6">
                {lines.map((l) => (
                  <CartLineItem key={l.key} line={l} onNavigate={() => setOpen(false)} />
                ))}
              </ul>
              <div className="border-t bg-secondary/40 px-6 py-5">
                <dl className="space-y-1.5 text-sm tabular-nums">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Total MRP ({itemsLabel})</dt>
                    <dd>{formatINR(mrpTotal)}</dd>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Discount on MRP</dt>
                      <dd className="text-primary">−{formatINR(savings)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Delivery</dt>
                    <dd className="text-right">Shown at checkout</dd>
                  </div>
                </dl>
                <p className="mt-3 flex gap-2 text-xs leading-relaxed text-muted-foreground">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Items aren't reserved until your order is placed. Prices and stock are confirmed
                  at checkout.
                </p>
                <div className="mt-4 flex flex-col gap-2 text-xs">
                  <WhatsAppButton variant="link" message={message}>
                    Order this bag on WhatsApp instead
                  </WhatsAppButton>
                  <WhatsAppButton
                    variant="link"
                    message={wholesaleMessage({
                      message: message.replace(
                        /^Hello DB Hub! I would like to order these items:\n\n/,
                        "",
                      ),
                    })}
                  >
                    Buying wholesale? Enquire on WhatsApp
                  </WhatsAppButton>
                </div>
              </div>
            </div>

            <footer className="shrink-0 border-t bg-background px-6 pb-5 pt-4 shadow-[0_-12px_24px_-18px_rgb(0_0_0/0.25)] [@media(max-height:32rem)]:py-3">
              <div className="flex items-baseline justify-between">
                <span className="font-medium">Subtotal</span>
                <span className="display text-2xl font-semibold tabular-nums">
                  {formatINR(subtotal)}
                </span>
              </div>
              {hasUnavailable && (
                <p role="alert" className="mt-2 text-xs text-destructive">
                  Update the items marked above to continue.
                </p>
              )}
              <button
                disabled={hasUnavailable}
                onClick={() => closeThen(() => void navigate({ to: "/checkout" }))}
                className="btn-primary mt-3 w-full justify-center rounded-lg disabled:cursor-not-allowed disabled:opacity-50 [@media(max-height:32rem)]:py-3"
              >
                Checkout
              </button>
              <button
                onClick={() => closeThen(() => void navigate({ to: "/cart" }))}
                className="btn-outline mt-2.5 w-full justify-center rounded-lg font-medium [@media(max-height:32rem)]:hidden"
              >
                View bag
              </button>
            </footer>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
