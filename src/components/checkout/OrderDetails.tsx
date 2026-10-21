import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { useOnlinePayment } from "@/components/checkout/use-online-payment";
import { ProductImage } from "@/components/product/parts";
import { STORES } from "@/config/site";
import { formatINR } from "@/lib/money";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, type PublicOrder } from "@/lib/orders";
import { retryPaymentFn } from "@/lib/api";

/** Items, totals, delivery and payment details for a placed order. */
export function OrderDetails({ order }: { order: PublicOrder }) {
  const f = order.fulfilment;
  return (
    <div className="border bg-card">
      <div className="grid gap-6 border-b p-6 text-sm sm:grid-cols-3">
        <Block title={f.kind === "delivery" ? "Delivery to" : "Pickup from"}>
          <p className="font-medium">
            {order.customer.name} · +91 {order.customer.phone}
          </p>
          <p className="mt-1 leading-relaxed text-muted-foreground">
            {f.kind === "delivery"
              ? [
                  f.address.line1,
                  f.address.line2,
                  f.address.city,
                  `${f.address.state} ${f.address.pin}`,
                ]
                  .filter(Boolean)
                  .join(", ")
              : `${f.city} store — ${STORES.find((s) => s.city === f.city)?.address ?? ""}`}
          </p>
        </Block>
        <Block title="Payment">
          <p className="font-medium">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
          <p className="mt-1 text-muted-foreground">
            {order.paymentStatus === "paid"
              ? "Paid"
              : order.paymentStatus === "failed"
                ? "Not completed"
                : order.paymentMethod === "razorpay"
                  ? "Awaiting confirmation"
                  : "Pay on " + (f.kind === "delivery" ? "delivery" : "collection")}
          </p>
        </Block>
        <Block title="Status">
          <p className="font-medium">{ORDER_STATUS_LABELS[order.status]}</p>
          <p className="mt-1 text-muted-foreground">
            Placed{" "}
            {new Date(order.createdAt).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </Block>
      </div>
      <ul className="divide-y px-6">
        {order.items.map((i) => (
          <li
            key={`${i.productId}-${i.size}-${i.colour}`}
            className="flex items-center gap-4 py-4 text-sm"
          >
            <ProductImage src={i.image} alt="" className="h-16 w-12 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-medium">{i.name}</p>
              <p className="text-[13px] text-muted-foreground">
                {i.colour} · Size {i.size} · Qty {i.qty} · {i.sku}
              </p>
            </div>
            <p className="tabular-nums">{formatINR(i.lineTotal)}</p>
          </li>
        ))}
      </ul>
      <dl className="space-y-1.5 border-t p-6 text-sm tabular-nums">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd>{formatINR(order.subtotal)}</dd>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Discount</dt>
            <dd>−{formatINR(order.discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Delivery</dt>
          <dd>
            {order.shipping === null
              ? "To be confirmed"
              : order.shipping === 0
                ? "Free"
                : formatINR(order.shipping)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between border-t pt-3">
          <dt className="font-medium">
            {order.shipping === null ? "Total (excl. delivery)" : "Total"}
          </dt>
          <dd className="display text-3xl font-semibold">{formatINR(order.total)}</dd>
        </div>
      </dl>
      {order.notes && (
        <p className="border-t px-6 py-4 text-sm text-muted-foreground">Note: {order.notes}</p>
      )}
      {order.demo && (
        <p className="border-t bg-secondary/50 px-6 py-3 text-xs text-muted-foreground">
          This order includes illustrative demo products. Our team will confirm real availability
          with you.
        </p>
      )}
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {children}
    </div>
  );
}

/** Re-opens Razorpay for an unpaid online order. */
export function RetryPaymentButton({
  orderNumber,
  token,
  label = "Try payment again",
}: {
  orderNumber: string;
  token: string;
  label?: string;
}) {
  const payOnline = useOnlinePayment();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError(null);
          const r = await retryPaymentFn({ data: { orderNumber, token } }).catch(() => null);
          if (r?.ok && "razorpay" in r && r.razorpay)
            await payOnline(orderNumber, token, r.razorpay);
          else
            setError(
              "We couldn't start the payment. Please try again shortly or order on WhatsApp.",
            );
          setBusy(false);
        }}
        className="btn-primary justify-center rounded-lg disabled:opacity-70"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        {label}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
