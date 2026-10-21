import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  createFileRoute,
  Link,
  useCanGoBack,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  CreditCard,
  Loader2,
  Lock,
  Phone,
  ShoppingBag,
  Store,
  Truck,
  Wallet,
} from "lucide-react";
import { useOnlinePayment } from "@/components/checkout/use-online-payment";
import { WhatsAppButton, WhatsAppIcon } from "@/components/common/WhatsAppButton";
import { Logo } from "@/components/layout/Logo";
import { ProductImage } from "@/components/product/parts";
import { CONTACT, PAYMENTS, SHIPPING, STORES } from "@/config/site";
import { useBag } from "@/hooks/use-bag";
import { primaryImage } from "@/lib/catalog";
import { INDIAN_STATES } from "@/lib/india";
import { formatINR } from "@/lib/money";
import {
  CHECKOUT_ERRORS,
  PAYMENT_METHOD_LABELS,
  addressSchema,
  customerSchema,
  fulfilmentLabel,
  type CheckoutErrorCode,
  type Fulfilment,
  type PaymentMethod,
} from "@/lib/orders";
import { quote } from "@/lib/pricing";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { waLink } from "@/lib/whatsapp";
import { getCheckoutCapabilities, placeOrderFn } from "@/lib/api";

export const Route = createFileRoute("/checkout")({
  loader: () => getCheckoutCapabilities(),
  head: () =>
    seo({
      title: "Checkout",
      description: "Complete your DB Hub order.",
      path: "/checkout",
      noindex: true,
    }),
  component: CheckoutPage,
});

type Choice = PaymentMethod | "whatsapp";
type Details = {
  customer: { name: string; phone: string; email: string };
  fulfilment: Fulfilment;
  payment: Choice;
  notes: string;
};

const INPUT =
  "mt-2 w-full rounded-lg border border-input bg-background px-4 py-3 text-[15px] outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/15 aria-invalid:border-destructive";
const FIELD_ORDER = ["name", "phone", "email", "line1", "line2", "city", "state", "pin", "notes"];

/** A checkout id that stays the same while the bag and choices are unchanged (so retries don't duplicate orders). */
function checkoutIdFor(signature: string) {
  try {
    const saved = JSON.parse(sessionStorage.getItem("dbhub-checkout") ?? "null") as {
      id: string;
      sig: string;
    } | null;
    if (saved?.sig === signature) return saved.id;
    const id = crypto.randomUUID();
    sessionStorage.setItem("dbhub-checkout", JSON.stringify({ id, sig: signature }));
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

function CheckoutPage() {
  const caps = Route.useLoaderData();
  const { ready, lines, hasUnavailable } = useBag();
  const [step, setStep] = useState<"details" | "review">("details");
  const [details, setDetails] = useState<Details | null>(null);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:h-20 lg:px-10">
          <Logo />
          <a
            href={`tel:${CONTACT.primary.tel}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">Need help?</span> {CONTACT.primary.display}
          </a>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-5 pb-24 pt-6 lg:px-10">
        <div className="relative">
          <BackButton
            onClick={step === "review" ? () => setStep("details") : undefined}
            className="mb-5 sm:absolute sm:left-0 sm:top-1/2 sm:mb-0 sm:-translate-y-1/2"
          />
          <Steps current={step === "details" ? 1 : 2} />
        </div>
        <h1 className="sr-only">Checkout</h1>

        {!ready ? (
          <div className="h-96" aria-busy="true" />
        ) : lines.length === 0 ? (
          <div className="mx-auto mt-16 max-w-md text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-secondary">
              <ShoppingBag className="h-7 w-7 text-primary" strokeWidth={1.5} />
            </span>
            <h2 className="display mt-5 text-4xl">Your bag is empty</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Add a few pieces before checking out.
            </p>
            <Link to="/shop" className="btn-primary mt-7 rounded-lg">
              Shop the collection
            </Link>
          </div>
        ) : hasUnavailable ? (
          <div className="mx-auto mt-16 max-w-md text-center">
            <h2 className="display text-4xl">Some items need attention</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              A size in your bag has sold out or has less stock than you chose. Update your bag to
              continue.
            </p>
            <Link to="/cart" className="btn-primary mt-7 rounded-lg">
              Review bag
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
            <MobileSummary fulfilment={details?.fulfilment ?? null} />
            <div>
              <DetailsForm
                hidden={step !== "details"}
                caps={caps}
                initial={details}
                onReview={(d) => {
                  setDetails(d);
                  setStep("review");
                  window.scrollTo({ top: 0 });
                }}
              />
              {step === "review" && details && (
                <Review details={details} caps={caps} onEdit={() => setStep("details")} />
              )}
            </div>
            <aside className="hidden lg:block">
              <div className="sticky top-8 border bg-card p-6">
                <OrderSummary fulfilment={details?.fulfilment ?? null} />
              </div>
            </aside>
          </div>
        )}
      </main>

      <footer className="border-t py-6 text-center text-[13px] text-muted-foreground">
        <Lock className="mr-1.5 inline h-3.5 w-3.5" />
        Card and UPI details are entered only in Razorpay's secure window — never on this site.
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
type Caps = ReturnType<typeof Route.useLoaderData>;

function paymentOptions(caps: Caps, fulfilment: Fulfilment["kind"], totalFinal: boolean) {
  const storage = caps.orderStorage;
  const offline = "Online ordering isn't switched on yet — use WhatsApp for now.";
  const opts: {
    id: Choice;
    label: string;
    note: string;
    icon: ReactNode;
    disabled?: string | undefined;
  }[] = [];
  if (PAYMENTS.razorpay)
    opts.push({
      id: "razorpay",
      label: "Pay online",
      note: "UPI, cards, net banking and wallets via Razorpay.",
      icon: <CreditCard className="h-5 w-5 text-primary" />,
      disabled: !caps.onlinePayments
        ? "Online payment is being set up and will be available soon."
        : !storage
          ? offline
          : !totalFinal
            ? "Available for store pickup until delivery charges are set up."
            : undefined,
    });
  if (PAYMENTS.cod && fulfilment === "delivery")
    opts.push({
      id: "cod",
      label: "Cash on delivery",
      note: "Pay by cash or UPI when your order arrives.",
      icon: <Wallet className="h-5 w-5 text-primary" />,
      disabled: storage ? undefined : offline,
    });
  if (PAYMENTS.payAtStore && fulfilment === "pickup")
    opts.push({
      id: "pay_at_store",
      label: "Pay at the store",
      note: "Pay by cash, card or UPI when you collect.",
      icon: <Store className="h-5 w-5 text-primary" />,
      disabled: storage ? undefined : offline,
    });
  opts.push({
    id: "whatsapp",
    label: "Confirm on WhatsApp",
    note: "Send the order to our team; pay after they confirm availability.",
    icon: <WhatsAppIcon className="h-5 w-5 text-[#1f7a4d]" />,
  });
  return opts;
}

function DetailsForm({
  hidden,
  caps,
  initial,
  onReview,
}: {
  hidden: boolean;
  caps: Caps;
  initial: Details | null;
  onReview: (d: Details) => void;
}) {
  const { lines } = useBag();
  const [kind, setKind] = useState<Fulfilment["kind"]>(initial?.fulfilment.kind ?? "delivery");
  const [city, setCity] = useState<string>(
    initial?.fulfilment.kind === "pickup" ? initial.fulfilment.city : STORES[0].city,
  );
  const [payment, setPayment] = useState<Choice | null>(initial?.payment ?? null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const q = quote(
    lines.map((l) => ({ unitPrice: l.unitPrice, qty: l.qty })),
    kind,
  );
  const options = paymentOptions(caps, kind, q.final);
  const enabled = options.filter((o) => !o.disabled);
  // Keep the chosen payment valid when delivery changes; default to the first available option.
  const effectivePayment =
    payment && enabled.some((o) => o.id === payment) ? payment : (enabled[0]?.id ?? "whatsapp");

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const errs: Record<string, string> = {};
    const customer = customerSchema.safeParse({
      name: data["name"],
      phone: data["phone"],
      email: data["email"] ?? "",
    });
    if (!customer.success)
      customer.error.issues.forEach((i) => {
        errs[String(i.path[0])] ??= i.message;
      });
    const address =
      kind === "delivery"
        ? addressSchema.safeParse({
            line1: data["line1"],
            line2: data["line2"] ?? "",
            city: data["city"],
            state: data["state"],
            pin: data["pin"],
          })
        : null;
    if (address && !address.success)
      address.error.issues.forEach((i) => {
        errs[String(i.path[0])] ??= i.message;
      });
    const notes = (data["notes"] ?? "").trim();
    if (notes.length > 500) errs["notes"] = "Max 500 characters";
    setErrors(errs);
    const first = FIELD_ORDER.find((f) => errs[f]);
    if (first || !customer.success || (address && !address.success)) {
      if (first) document.getElementById(first)?.focus();
      return;
    }
    onReview({
      customer: customer.data,
      fulfilment:
        kind === "delivery"
          ? { kind: "delivery", address: address!.data! }
          : { kind: "pickup", city },
      payment: effectivePayment,
      notes,
    });
  };

  const a = (n: string) => ({
    id: n,
    name: n,
    "aria-invalid": Boolean(errors[n]),
    "aria-describedby": errors[n] ? `${n}-err` : undefined,
  });
  const addr = initial?.fulfilment.kind === "delivery" ? initial.fulfilment.address : undefined;

  return (
    <form onSubmit={submit} noValidate hidden={hidden} className="space-y-12">
      <Section step={1} title="Contact details">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="name" label="Full name" error={errors["name"]}>
            <input
              {...a("name")}
              defaultValue={initial?.customer.name}
              className={INPUT}
              autoComplete="name"
              placeholder="e.g. Priya Raman"
            />
          </Field>
          <Field id="phone" label="Mobile number" error={errors["phone"]}>
            <div
              className={cn(
                "mt-2 flex overflow-hidden rounded-lg border bg-background transition focus-within:ring-2",
                errors["phone"]
                  ? "border-destructive focus-within:ring-destructive/15"
                  : "border-input focus-within:border-primary focus-within:ring-primary/15",
              )}
            >
              <span className="flex items-center border-r bg-secondary/40 px-3.5 text-[15px] text-muted-foreground">
                +91
              </span>
              <input
                {...a("phone")}
                defaultValue={initial?.customer.phone}
                inputMode="tel"
                maxLength={14}
                autoComplete="tel-national"
                placeholder="98765 43210"
                className="w-full bg-transparent px-4 py-3 text-[15px] outline-none placeholder:text-muted-foreground/60"
              />
            </div>
          </Field>
          <Field
            id="email"
            label="Email"
            optional
            hint="For your order confirmation"
            error={errors["email"]}
            className="sm:col-span-2"
          >
            <input
              {...a("email")}
              defaultValue={initial?.customer.email}
              type="email"
              className={INPUT}
              autoComplete="email"
              placeholder="you@example.com"
            />
          </Field>
        </div>
      </Section>

      <Section step={2} title="Delivery">
        <fieldset>
          <legend className="sr-only">Delivery method</legend>
          <div className="grid gap-3">
            <ChoiceCard
              name="fulfilment"
              checked={kind === "delivery"}
              onChange={() => setKind("delivery")}
              icon={<Truck className="h-5 w-5 text-primary" />}
              label="Home delivery"
              note={`Anywhere in ${SHIPPING.deliveryCountry}. ${SHIPPING.flatFee === null ? "Delivery charges are confirmed by our team." : ""}`}
              aside={SHIPPING.flatFee === null ? "TBC" : formatINR(SHIPPING.flatFee)}
            />
            {STORES.map((s) => (
              <ChoiceCard
                key={s.city}
                name="fulfilment"
                checked={kind === "pickup" && city === s.city}
                onChange={() => {
                  setKind("pickup");
                  setCity(s.city);
                }}
                icon={<Store className="h-5 w-5 text-primary" />}
                label={`Store pickup · ${s.city}`}
                note={s.address}
                aside="Free"
              />
            ))}
          </div>
        </fieldset>
        {/* Hidden rather than unmounted so a typed address survives switching to pickup and back. */}
        <div className={cn("mt-8 gap-6 sm:grid-cols-2", kind === "delivery" ? "grid" : "hidden")}>
          <Field
            id="line1"
            label="House no., building, street"
            error={errors["line1"]}
            className="sm:col-span-2"
          >
            <input
              {...a("line1")}
              defaultValue={addr?.line1}
              className={INPUT}
              autoComplete="address-line1"
              placeholder="e.g. 12, Lake View Road"
            />
          </Field>
          <Field
            id="line2"
            label="Apartment, area or landmark"
            optional
            error={errors["line2"]}
            className="sm:col-span-2"
          >
            <input
              {...a("line2")}
              defaultValue={addr?.line2}
              className={INPUT}
              autoComplete="address-line2"
              placeholder="e.g. Near Anna Nagar Tower"
            />
          </Field>
          <Field id="city" label="City" error={errors["city"]}>
            <input
              {...a("city")}
              defaultValue={addr?.city}
              className={INPUT}
              autoComplete="address-level2"
              placeholder="e.g. Chennai"
            />
          </Field>
          <Field id="pin" label="PIN code" error={errors["pin"]}>
            <input
              {...a("pin")}
              defaultValue={addr?.pin}
              className={INPUT}
              inputMode="numeric"
              maxLength={6}
              autoComplete="postal-code"
              placeholder="6-digit PIN"
            />
          </Field>
          <Field id="state" label="State" error={errors["state"]} className="sm:col-span-2">
            <select
              {...a("state")}
              defaultValue={addr?.state ?? "Tamil Nadu"}
              className={INPUT}
              autoComplete="address-level1"
            >
              {INDIAN_STATES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      <Section step={3} title="Payment">
        <fieldset>
          <legend className="sr-only">Payment method</legend>
          <div className="grid gap-3">
            {options.map((o) => (
              <ChoiceCard
                key={o.id}
                name="payment"
                checked={effectivePayment === o.id}
                disabled={Boolean(o.disabled)}
                onChange={() => setPayment(o.id)}
                icon={o.icon}
                label={o.label}
                note={o.disabled ?? o.note}
              />
            ))}
          </div>
        </fieldset>
        <div className="mt-8">
          <Field
            id="notes"
            label="Delivery instructions or order note"
            optional
            error={errors["notes"]}
          >
            <textarea
              {...a("notes")}
              defaultValue={initial?.notes}
              rows={2}
              className={cn(INPUT, "resize-none")}
              placeholder="Preferred call time, landmark, fit questions…"
            />
          </Field>
        </div>
      </Section>

      <button type="submit" className="btn-primary w-full justify-center rounded-lg">
        Review order
      </button>
    </form>
  );
}

function Review({ details, caps, onEdit }: { details: Details; caps: Caps; onEdit: () => void }) {
  const { lines, clear } = useBag();
  const navigate = useNavigate();
  const payOnline = useOnlinePayment();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<CheckoutErrorCode | null>(null);
  const [sentToWhatsApp, setSentToWhatsApp] = useState(false);
  const q = quote(
    lines.map((l) => ({ unitPrice: l.unitPrice, qty: l.qty })),
    details.fulfilment.kind,
  );
  const items = lines.map((l) => ({
    productId: l.product.id,
    size: l.size,
    colour: l.colour,
    qty: l.qty,
  }));
  const signature = JSON.stringify({
    items,
    f: details.fulfilment,
    p: details.payment,
    c: details.customer,
  });
  const checkoutId = useMemo(() => checkoutIdFor(signature), [signature]);

  const whatsappText = [
    "Hello DB Hub! I'd like to place this order:",
    "",
    ...lines.map(
      (l, i) =>
        `${i + 1}. ${l.product.name} — Size ${l.size}, ${l.colour} × ${l.qty}${l.variant ? ` (${l.variant.sku})` : ""} — ${formatINR(l.lineTotal)}`,
    ),
    "",
    `Subtotal at listed prices: ${formatINR(q.subtotal)}`,
    `Name: ${details.customer.name}`,
    `Mobile: +91 ${details.customer.phone}`,
    details.fulfilment.kind === "delivery"
      ? `Deliver to: ${[details.fulfilment.address.line1, details.fulfilment.address.line2, details.fulfilment.address.city, details.fulfilment.address.state, details.fulfilment.address.pin].filter(Boolean).join(", ")}`
      : `Store pickup: ${details.fulfilment.city}`,
    details.notes ? `Note: ${details.notes}` : null,
    "",
    "Please confirm availability, the final price and delivery charges. I understand this is not a paid order yet.",
  ]
    .filter((x): x is string => x !== null)
    .join("\n");

  const place = async () => {
    if (details.payment === "whatsapp") {
      window.open(waLink(whatsappText), "_blank", "noopener,noreferrer");
      setSentToWhatsApp(true);
      return;
    }
    setBusy(true);
    setError(null);
    const result = await placeOrderFn({
      data: {
        checkoutId,
        items,
        customer: details.customer,
        fulfilment: details.fulfilment,
        paymentMethod: details.payment,
        notes: details.notes,
      },
    }).catch(() => ({ ok: false as const, error: "PAYMENT_PROVIDER_ERROR" as const }));
    if (!result.ok) {
      setBusy(false);
      setError(result.error);
      return;
    }
    clear();
    try {
      sessionStorage.removeItem("dbhub-checkout");
    } catch {
      /* ignore */
    }
    if (result.razorpay) {
      await payOnline(result.orderNumber, result.token, result.razorpay);
      return;
    }
    void navigate({
      to: "/order/$orderNumber",
      params: { orderNumber: result.orderNumber },
      search: { token: result.token },
    });
  };

  if (sentToWhatsApp) {
    return (
      <div className="border bg-card p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#1f7a4d]/10">
          <WhatsAppIcon className="h-7 w-7 text-[#1f7a4d]" />
        </span>
        <h2 className="display mt-5 text-4xl">Send the message in WhatsApp</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          We've opened WhatsApp with your order details. Your order reaches us once you press send —
          our team will confirm availability, the final price and delivery before you pay.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <WhatsAppButton message={whatsappText} className="rounded-lg">
            Open WhatsApp again
          </WhatsAppButton>
          <button
            type="button"
            onClick={() => {
              clear();
              void navigate({ to: "/" });
            }}
            className="btn-outline rounded-lg"
          >
            I've sent it — clear my bag
          </button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Your bag is kept until you clear it, in case you need to resend.
        </p>
      </div>
    );
  }

  const label =
    details.payment === "razorpay"
      ? `Pay ${formatINR(q.total)}`
      : details.payment === "whatsapp"
        ? "Send order on WhatsApp"
        : `Place order · ${formatINR(q.total)}`;

  return (
    <div className="space-y-8">
      <div className="flex items-baseline justify-between">
        <h2 className="display text-4xl">Review your order</h2>
        <button
          type="button"
          onClick={onEdit}
          className="text-sm underline underline-offset-4 hover:text-primary"
        >
          Edit details
        </button>
      </div>
      <div className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-3">
        <ReviewBlock title="Contact">
          <p className="font-medium">{details.customer.name}</p>
          <p>+91 {details.customer.phone}</p>
          {details.customer.email && <p className="break-all">{details.customer.email}</p>}
        </ReviewBlock>
        <ReviewBlock title={details.fulfilment.kind === "delivery" ? "Delivery to" : "Pickup from"}>
          {details.fulfilment.kind === "delivery" ? (
            <p>
              {[
                details.fulfilment.address.line1,
                details.fulfilment.address.line2,
                details.fulfilment.address.city,
                `${details.fulfilment.address.state} ${details.fulfilment.address.pin}`,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
          ) : (
            <p>
              {
                STORES.find((s) => s.city === (details.fulfilment as { city: string }).city)
                  ?.address
              }
            </p>
          )}
        </ReviewBlock>
        <ReviewBlock title="Payment">
          <p className="font-medium">
            {details.payment === "whatsapp"
              ? "Confirm on WhatsApp"
              : PAYMENT_METHOD_LABELS[details.payment]}
          </p>
          {details.notes && <p className="mt-1 text-muted-foreground">Note: {details.notes}</p>}
        </ReviewBlock>
      </div>

      <ul className="divide-y border-y">
        {lines.map((l) => (
          <li key={l.key} className="flex items-center gap-4 py-4 text-sm">
            <ProductImage
              src={primaryImage(l.product, l.colour)?.src}
              alt=""
              className="h-20 w-[60px] shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="font-medium">{l.product.name}</p>
              <p className="text-[13px] text-muted-foreground">
                Size {l.size} · {l.colour} · Qty {l.qty}
              </p>
            </div>
            <p className="tabular-nums">{formatINR(l.lineTotal)}</p>
          </li>
        ))}
      </ul>

      <Totals fulfilment={details.fulfilment} />

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm"
        >
          <p className="text-destructive">{CHECKOUT_ERRORS[error]}</p>
          {(error === "ORDER_STORAGE_UNAVAILABLE" ||
            error === "PAYMENTS_NOT_CONFIGURED" ||
            error === "PAYMENT_PROVIDER_ERROR") && (
            <WhatsAppButton variant="link" message={whatsappText} className="mt-2 font-medium">
              Send this order on WhatsApp instead
            </WhatsAppButton>
          )}
          {error === "ITEM_UNAVAILABLE" && (
            <Link to="/cart" className="mt-2 inline-block font-medium underline">
              Review bag
            </Link>
          )}
        </div>
      )}

      <div>
        <button
          type="button"
          onClick={place}
          disabled={busy}
          className="btn-primary w-full justify-center rounded-lg disabled:opacity-70"
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Placing order…
            </>
          ) : (
            label
          )}
        </button>
        <p className="mt-3 text-center text-[13px] leading-relaxed text-muted-foreground">
          By placing this order you agree to our{" "}
          <Link to="/policies/terms" className="underline">
            terms
          </Link>{" "}
          and{" "}
          <Link to="/policies/returns" className="underline">
            returns policy
          </Link>
          .{" "}
          {details.payment !== "razorpay" &&
            "Our team will contact you to confirm before anything is dispatched."}
        </p>
        {caps.devStore && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Development mode: orders are saved in memory only.
          </p>
        )}
        {details.payment === "razorpay" && caps.paymentsTestMode && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Razorpay test mode — no real money is charged.
          </p>
        )}
      </div>
    </div>
  );
}

function ReviewBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-card p-4 text-sm leading-relaxed">
      <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Totals({ fulfilment }: { fulfilment: Fulfilment | null }) {
  const { lines, count, mrpTotal } = useBag();
  const q = quote(
    lines.map((l) => ({ unitPrice: l.unitPrice, qty: l.qty })),
    fulfilment?.kind ?? "delivery",
  );
  const savings = mrpTotal - q.subtotal;
  return (
    <dl className="space-y-1.5 text-sm tabular-nums">
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
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Subtotal</dt>
        <dd>{formatINR(q.subtotal)}</dd>
      </div>
      <div className="flex justify-between gap-3">
        <dt className="text-muted-foreground">Delivery</dt>
        <dd className="text-right">
          {!fulfilment
            ? "Choose delivery or pickup"
            : q.shipping === null
              ? "Confirmed by our team"
              : q.shipping === 0
                ? "Free"
                : formatINR(q.shipping)}
        </dd>
      </div>
      <div className="!mt-3 flex items-baseline justify-between border-t pt-3">
        <dt className="font-medium">
          {q.final && fulfilment ? "Total" : "Total (excl. delivery)"}
        </dt>
        <dd className="display text-3xl font-semibold">{formatINR(q.total)}</dd>
      </div>
    </dl>
  );
}

function OrderSummary({ fulfilment }: { fulfilment: Fulfilment | null }) {
  const { lines, setOpen } = useBag();
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h2 className="display text-3xl">Order summary</h2>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-sm underline underline-offset-4 hover:text-primary"
        >
          Edit bag
        </button>
      </div>
      <ul className="thin-scroll mt-5 max-h-80 space-y-4 overflow-y-auto pr-1 pt-2">
        {lines.map((l) => (
          <li key={l.key} className="flex gap-3">
            <div className="relative shrink-0">
              <ProductImage
                src={primaryImage(l.product, l.colour)?.src}
                alt=""
                className="h-20 w-[60px]"
              />
              <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-foreground px-1 text-[11px] font-semibold text-background">
                {l.qty}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium leading-snug">{l.product.name}</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {l.colour} · Size {l.size}
              </p>
            </div>
            <p className="text-sm tabular-nums">{formatINR(l.lineTotal)}</p>
          </li>
        ))}
      </ul>
      <div className="mt-5 border-t pt-4">
        <Totals fulfilment={fulfilment} />
      </div>
      {fulfilment && (
        <p className="mt-3 text-xs text-muted-foreground">{fulfilmentLabel(fulfilment)}</p>
      )}
    </div>
  );
}

function MobileSummary({ fulfilment }: { fulfilment: Fulfilment | null }) {
  const { subtotal } = useBag();
  return (
    <details className="group border bg-card lg:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2 font-medium">
          <ShoppingBag className="h-4 w-4 text-primary" />
          Order summary
          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
        </span>
        <span className="display text-2xl font-semibold">{formatINR(subtotal)}</span>
      </summary>
      <div className="border-t px-5 pb-5 pt-4">
        <OrderSummary fulfilment={fulfilment} />
      </div>
    </details>
  );
}

const STEPS = ["Bag", "Details", "Review"];

function Steps({ current }: { current: number }) {
  return (
    <ol
      aria-label="Checkout progress"
      className="flex items-center justify-center gap-2 text-sm sm:gap-3"
    >
      {STEPS.map((step, i) => (
        <li
          key={step}
          aria-current={i === current ? "step" : undefined}
          className="flex items-center gap-2 sm:gap-3"
        >
          <span
            className={cn(
              "grid h-7 w-7 place-items-center rounded-full border text-xs font-semibold",
              i < current
                ? "border-primary bg-primary text-primary-foreground"
                : i === current
                  ? "border-primary text-primary"
                  : "text-muted-foreground",
            )}
          >
            {i < current ? <Check className="h-3 w-3" /> : i + 1}
          </span>
          {/* Narrow phones only have room to name the current step. */}
          <span
            className={
              i === current ? "font-medium" : "sr-only text-muted-foreground sm:not-sr-only"
            }
          >
            {step}
          </span>
          {i < STEPS.length - 1 && (
            <span aria-hidden="true" className="h-px w-6 bg-border sm:w-14" />
          )}
        </li>
      ))}
    </ol>
  );
}

/** Back to the previous page on this site (or the shop if checkout was opened directly). */
function BackButton({
  className,
  onClick,
}: {
  className?: string;
  onClick?: (() => void) | undefined;
}) {
  const router = useRouter();
  const navigate = useNavigate();
  const canGoBack = useCanGoBack();
  return (
    <button
      type="button"
      onClick={
        onClick ?? (() => (canGoBack ? router.history.back() : void navigate({ to: "/shop" })))
      }
      className={cn(
        "group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
      Back
    </button>
  );
}

function Section({ step, title, children }: { step: number; title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="flex items-center gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {step}
        </span>
        <span className="display text-3xl">{title}</span>
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Field({
  id,
  label,
  optional = false,
  hint,
  error,
  className = "",
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string | undefined;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {optional && (
          <span className="ml-1 font-normal text-muted-foreground">
            (optional{hint ? ` — ${hint.toLowerCase()}` : ""})
          </span>
        )}
      </label>
      {children}
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-[13px] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function ChoiceCard({
  name,
  checked,
  onChange,
  label,
  note,
  icon,
  aside,
  disabled = false,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  note: string;
  icon?: ReactNode;
  aside?: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex items-start gap-4 rounded-lg border p-4 transition-colors",
        disabled ? "cursor-not-allowed bg-muted/40 opacity-70" : "cursor-pointer",
        checked && !disabled
          ? "border-primary bg-secondary/50"
          : !disabled && "hover:border-foreground/40",
      )}
    >
      <input
        type="radio"
        name={name}
        checked={checked && !disabled}
        disabled={disabled}
        onChange={onChange}
        className="mt-1 h-4 w-4 shrink-0 accent-primary"
      />
      {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-medium">{label}</span>
        <span className="mt-1 block text-[13px] leading-relaxed text-muted-foreground">{note}</span>
      </span>
      {aside && <span className="shrink-0 text-sm font-medium">{aside}</span>}
    </label>
  );
}
