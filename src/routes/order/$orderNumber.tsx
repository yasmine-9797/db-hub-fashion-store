import { useEffect } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { AlertCircle, Check, Clock, Loader2, PackageCheck } from "lucide-react";
import { OrderDetails, RetryPaymentButton } from "@/components/checkout/OrderDetails";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { Container, PageShell } from "@/components/layout/PageShell";
import { CONTACT } from "@/config/site";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  fulfilmentLabel,
  type PublicOrder,
} from "@/lib/orders";
import { seo } from "@/lib/seo";
import { orderMessage } from "@/lib/whatsapp";
import { getOrderFn } from "@/lib/api";

export const Route = createFileRoute("/order/$orderNumber")({
  validateSearch: (s: Record<string, unknown>) => ({
    token: typeof s["token"] === "string" ? s["token"] : "",
  }),
  loaderDeps: ({ search }) => ({ token: search.token }),
  loader: ({ params, deps }) =>
    getOrderFn({ data: { orderNumber: params.orderNumber, token: deps.token } }).catch(() => ({
      ok: false as const,
      error: "ORDER_NOT_FOUND" as const,
    })),
  head: ({ params }) =>
    seo({
      title: `Order ${params.orderNumber}`,
      description: "Your DB Hub order.",
      path: "/order",
      noindex: true,
    }),
  component: OrderPage,
});

function OrderPage() {
  const result = Route.useLoaderData();
  const { token } = Route.useSearch();
  const { orderNumber } = Route.useParams();
  const router = useRouter();
  const awaiting = result.ok && result.order.status === "payment_initiated";

  // While a payment is being confirmed (e.g. waiting for Razorpay's webhook), check again every few seconds.
  useEffect(() => {
    if (!awaiting) return;
    let n = 0;
    const t = setInterval(() => {
      if (++n > 15) clearInterval(t);
      else void router.invalidate();
    }, 4000);
    return () => clearInterval(t);
  }, [awaiting, router]);

  return (
    <PageShell>
      <Container className="max-w-3xl pb-24 pt-10">
        {!result.ok ? (
          <div className="py-16 text-center">
            <h1 className="display text-5xl">Order not found</h1>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              This order link is incomplete or has expired. If you placed an order, contact us with
              your order number and we'll help.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <WhatsAppButton
                message={`Hello DB Hub! I need help with my order ${orderNumber}.`}
                className="rounded-lg"
              >
                Contact us on WhatsApp
              </WhatsAppButton>
              <Link to="/shop" className="btn-outline rounded-lg">
                Continue shopping
              </Link>
            </div>
          </div>
        ) : (
          <>
            <StatusHero order={result.order} token={token} />
            <div className="mt-12">
              <OrderDetails order={result.order} />
            </div>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <WhatsAppButton
                variant="outline"
                className="rounded-lg"
                message={orderMessage({
                  orderNumber: result.order.orderNumber,
                  name: result.order.customer.name,
                  phone: `+91 ${result.order.customer.phone}`,
                  total: result.order.total,
                  fulfilment: fulfilmentLabel(result.order.fulfilment),
                  payment: PAYMENT_METHOD_LABELS[result.order.paymentMethod],
                })}
              >
                Message us about this order
              </WhatsAppButton>
              <Link to="/shop" className="btn-outline rounded-lg">
                Continue shopping
              </Link>
            </div>
            <p className="mt-6 text-center text-xs text-muted-foreground">
              Bookmark this page to check your order later — the link is private to you.
            </p>
          </>
        )}
      </Container>
    </PageShell>
  );
}

function StatusHero({ order, token }: { order: PublicOrder; token: string }) {
  const first = order.customer.name.split(" ")[0];
  const where = order.fulfilment.kind === "delivery" ? "delivery" : "collection";
  const icon = (cls: string, el: React.ReactNode) => (
    <span className={`mx-auto grid h-16 w-16 place-items-center rounded-full ${cls}`}>{el}</span>
  );

  let content;
  if (
    order.status === "paid" ||
    (order.paymentStatus === "paid" && order.paymentMethod === "razorpay")
  ) {
    content = {
      icon: icon("bg-primary text-primary-foreground", <Check className="h-8 w-8" />),
      title: `Thank you, ${first}.`,
      text: `Payment received and verified. We'll contact you on +91 ${order.customer.phone} about ${where}.`,
    };
  } else if (order.status === "pending") {
    content = {
      icon: icon("bg-primary text-primary-foreground", <PackageCheck className="h-8 w-8" />),
      title: `Order placed, ${first}.`,
      text: `Our team will call you on +91 ${order.customer.phone} to confirm availability before ${where}. You'll pay ${order.paymentMethod === "cod" ? "when it's delivered" : "when you collect it"}.`,
    };
  } else if (order.status === "payment_initiated") {
    content = {
      icon: icon("bg-secondary text-primary", <Loader2 className="h-8 w-8 animate-spin" />),
      title: "Confirming your payment…",
      text: "This usually takes a few seconds. If you closed the payment window before paying, you can pay below.",
      retry: true,
    };
  } else if (order.status === "payment_failed") {
    content = {
      icon: icon("bg-destructive/10 text-destructive", <AlertCircle className="h-8 w-8" />),
      title: "Payment didn't go through",
      text: "No payment has been recorded for this order. You can try again, or send the order to us on WhatsApp.",
      retry: true,
    };
  } else {
    content = {
      icon: icon("bg-secondary text-primary", <Clock className="h-8 w-8" />),
      title: ORDER_STATUS_LABELS[order.status],
      text: `Questions? Call ${CONTACT.primary.display} or message us on WhatsApp.`,
    };
  }

  return (
    <div className="text-center">
      {content.icon}
      <p className="eyebrow mt-6 text-sm text-primary">Order {order.orderNumber}</p>
      <h1 className="display mt-3 text-5xl">{content.title}</h1>
      <p className="mx-auto mt-4 max-w-lg leading-relaxed text-muted-foreground">{content.text}</p>
      {"retry" in content && content.retry && order.paymentMethod === "razorpay" && (
        <div className="mt-7 flex justify-center">
          <RetryPaymentButton
            orderNumber={order.orderNumber}
            token={token}
            label={order.status === "payment_failed" ? "Try payment again" : "Pay now"}
          />
        </div>
      )}
    </div>
  );
}
