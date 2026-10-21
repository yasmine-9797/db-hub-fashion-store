import { useEffect } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { AlertCircle, Check, Loader2, WifiOff, XCircle } from "lucide-react";
import { RetryPaymentButton } from "@/components/checkout/OrderDetails";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { Container, PageShell } from "@/components/layout/PageShell";
import { formatINR } from "@/lib/money";
import { seo } from "@/lib/seo";
import { getOrderFn } from "@/lib/api";

const RESULTS = ["failed", "cancelled", "pending", "unavailable"] as const;
type Result = (typeof RESULTS)[number];

export const Route = createFileRoute("/payment-status")({
  validateSearch: (s: Record<string, unknown>) => ({
    order: typeof s["order"] === "string" ? s["order"] : "",
    token: typeof s["token"] === "string" ? s["token"] : "",
    result: (RESULTS as readonly unknown[]).includes(s["result"])
      ? (s["result"] as Result)
      : ("pending" as Result),
  }),
  loaderDeps: ({ search }) => ({ order: search.order, token: search.token }),
  loader: ({ deps }) =>
    getOrderFn({ data: { orderNumber: deps.order, token: deps.token } }).catch(() => ({
      ok: false as const,
      error: "ORDER_NOT_FOUND" as const,
    })),
  head: () =>
    seo({
      title: "Payment status",
      description: "Status of your DB Hub payment.",
      path: "/payment-status",
      noindex: true,
    }),
  component: PaymentStatusPage,
});

function PaymentStatusPage() {
  const data = Route.useLoaderData();
  const { order: orderNumber, token, result } = Route.useSearch();
  const router = useRouter();
  const order = data.ok ? data.order : null;
  const paid = order?.paymentStatus === "paid";
  const waiting = order?.status === "payment_initiated" && result === "pending";

  useEffect(() => {
    if (!waiting) return;
    let n = 0;
    const t = setInterval(() => {
      if (++n > 15) clearInterval(t);
      else void router.invalidate();
    }, 4000);
    return () => clearInterval(t);
  }, [waiting, router]);

  const view = !order
    ? {
        icon: <AlertCircle className="h-8 w-8" />,
        tone: "bg-destructive/10 text-destructive",
        title: "We couldn't load this payment",
        text: "The link is incomplete or has expired. Contact us with your order number and we'll check it for you.",
      }
    : paid
      ? {
          icon: <Check className="h-8 w-8" />,
          tone: "bg-primary text-primary-foreground",
          title: "Payment successful",
          text: "Your payment has been verified. You can view your order below.",
        }
      : waiting
        ? {
            icon: <Loader2 className="h-8 w-8 animate-spin" />,
            tone: "bg-secondary text-primary",
            title: "Confirming your payment…",
            text: "We're waiting for confirmation from Razorpay. This page updates automatically.",
          }
        : result === "cancelled"
          ? {
              icon: <XCircle className="h-8 w-8" />,
              tone: "bg-secondary text-primary",
              title: "Payment not completed",
              text: "The payment window was closed before the payment finished. Your order is saved — you can pay whenever you're ready.",
            }
          : result === "unavailable"
            ? {
                icon: <WifiOff className="h-8 w-8" />,
                tone: "bg-secondary text-primary",
                title: "Payment window didn't open",
                text: "Check your connection or turn off any blocker for checkout.razorpay.com, then try again.",
              }
            : {
                icon: <AlertCircle className="h-8 w-8" />,
                tone: "bg-destructive/10 text-destructive",
                title: "Payment failed",
                text: "The payment didn't go through and the order is not marked as paid. If money was deducted, it's normally returned by your bank automatically — or contact us with your order number.",
              };

  return (
    <PageShell>
      <Container className="max-w-2xl pb-24 pt-14 text-center">
        <span className={`mx-auto grid h-16 w-16 place-items-center rounded-full ${view.tone}`}>
          {view.icon}
        </span>
        {orderNumber && <p className="eyebrow mt-6 text-sm text-primary">Order {orderNumber}</p>}
        <h1 className="display mt-3 text-5xl">{view.title}</h1>
        <p className="mx-auto mt-4 max-w-lg leading-relaxed text-muted-foreground">{view.text}</p>
        {order && !paid && (
          <p className="mt-3 text-sm">
            Amount due: <strong>{formatINR(order.total)}</strong>
          </p>
        )}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {order && !paid && !waiting && order.paymentMethod === "razorpay" && (
            <RetryPaymentButton orderNumber={orderNumber} token={token} />
          )}
          {order && (
            <Link
              to="/order/$orderNumber"
              params={{ orderNumber }}
              search={{ token }}
              className="btn-outline rounded-lg"
            >
              View order
            </Link>
          )}
          {!paid && (
            <WhatsAppButton
              variant="outline"
              className="rounded-lg"
              message={`Hello DB Hub! I need help with the payment for order ${orderNumber || "(no number)"}.`}
            >
              Get help on WhatsApp
            </WhatsAppButton>
          )}
        </div>
      </Container>
    </PageShell>
  );
}
