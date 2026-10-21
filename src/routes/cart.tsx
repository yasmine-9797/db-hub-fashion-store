import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container, PageShell } from "@/components/layout/PageShell";
import { useBag } from "@/hooks/use-bag";
import { formatINR } from "@/lib/money";
import { seo } from "@/lib/seo";
import { cartMessage } from "@/lib/whatsapp";

export const Route = createFileRoute("/cart")({
  head: () =>
    seo({
      title: "Your bag",
      description: "Review the items in your DB Hub bag.",
      path: "/cart",
      noindex: true,
    }),
  component: CartPage,
});

function CartPage() {
  const { ready, lines, count, subtotal, mrpTotal, hasUnavailable } = useBag();
  const savings = mrpTotal - subtotal;
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
    <PageShell>
      <Container className="pb-24 pt-8 lg:pt-10">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Bag" }]} />
        <h1 className="display mt-5 text-5xl sm:text-6xl">Your bag</h1>
        {!ready ? (
          <div className="h-80" aria-busy="true" />
        ) : lines.length === 0 ? (
          <div className="mt-10 border border-dashed px-6 py-20 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-secondary">
              <ShoppingBag className="h-7 w-7 text-primary" strokeWidth={1.5} />
            </span>
            <p className="display mt-5 text-3xl">Your bag is empty</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Your next favourite outfit is waiting.
            </p>
            <Link to="/shop" className="btn-primary mt-7 rounded-lg">
              Shop the collection
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
            <ul className="divide-y border-y">
              {lines.map((l) => (
                <CartLineItem key={l.key} line={l} large />
              ))}
            </ul>
            <aside
              aria-labelledby="summary-title"
              className="h-fit border bg-card p-6 lg:sticky lg:top-28"
            >
              <h2 id="summary-title" className="display text-3xl">
                Summary
              </h2>
              <dl className="mt-5 space-y-2 text-sm tabular-nums">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">
                    Total MRP ({count} {count === 1 ? "item" : "items"})
                  </dt>
                  <dd>{formatINR(mrpTotal)}</dd>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Discount on MRP</dt>
                    <dd className="text-primary">−{formatINR(savings)}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd className="text-right">Calculated at checkout</dd>
                </div>
                <div className="flex items-baseline justify-between border-t pt-3">
                  <dt className="font-medium">Subtotal</dt>
                  <dd className="display text-3xl font-semibold">{formatINR(subtotal)}</dd>
                </div>
              </dl>
              {hasUnavailable && (
                <p role="alert" className="mt-3 text-xs text-destructive">
                  Some items are no longer available in the chosen size — update them to continue.
                </p>
              )}
              {hasUnavailable ? (
                <button
                  disabled
                  className="btn-primary mt-5 w-full cursor-not-allowed justify-center rounded-lg opacity-50"
                >
                  Checkout
                </button>
              ) : (
                <Link to="/checkout" className="btn-primary mt-5 w-full justify-center rounded-lg">
                  Checkout
                </Link>
              )}
              <WhatsAppButton
                variant="outline"
                message={message}
                className="mt-3 w-full rounded-lg"
              >
                Order on WhatsApp
              </WhatsAppButton>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                A WhatsApp order is an enquiry — we confirm availability and price before you pay.
              </p>
              <Link
                to="/shop"
                className="mt-5 block text-center text-sm underline underline-offset-4 hover:text-primary"
              >
                Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </Container>
    </PageShell>
  );
}
