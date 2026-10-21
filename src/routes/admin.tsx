import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ChevronDown, Loader2, LogOut, ShieldAlert } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { CONTACT, PAYMENTS, SHIPPING } from "@/config/site";
import { ACTIVE_PRODUCTS, CATALOGUE_IS_DEMO, categoryName, totalStock } from "@/lib/catalog";
import { formatINR } from "@/lib/money";
import {
  ADMIN_TRANSITIONS,
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  fulfilmentLabel,
  type OrderStatus,
  type PublicOrder,
} from "@/lib/orders";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";
import {
  adminEnquiriesFn,
  adminLoginFn,
  adminLogoutFn,
  adminMarkCashCollectedFn,
  adminOrdersFn,
  adminStatusFn,
  adminUpdateStatusFn,
} from "@/lib/api";

const TABS = ["orders", "enquiries", "catalogue", "settings"] as const;
type Tab = (typeof TABS)[number];

export const Route = createFileRoute("/admin")({
  validateSearch: (s: Record<string, unknown>) => ({
    tab:
      (TABS as readonly unknown[]).includes(s["tab"]) && s["tab"] !== "orders"
        ? (s["tab"] as Tab)
        : undefined,
    status: (ORDER_STATUSES as readonly unknown[]).includes(s["status"])
      ? (s["status"] as OrderStatus)
      : undefined,
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const auth = await adminStatusFn();
    if (!auth.signedIn) return { auth, orders: null, enquiries: null };
    // Server functions re-check the session; a stale page just falls back to the login form.
    const [orders, enquiries] = await Promise.all([
      !deps.tab ? adminOrdersFn({ data: { status: deps.status } }).catch(() => null) : null,
      deps.tab === "enquiries" ? adminEnquiriesFn().catch(() => null) : null,
    ]);
    return { auth, orders, enquiries };
  },
  head: () =>
    seo({
      title: "Admin",
      description: "DB Hub store administration.",
      path: "/admin",
      noindex: true,
    }),
  component: AdminPage,
});

function AdminPage() {
  const { auth, orders, enquiries } = Route.useLoaderData();
  const { tab: tabParam, status } = Route.useSearch();
  const tab = tabParam ?? "orders";
  const router = useRouter();

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-10">
          <div className="flex items-center gap-3">
            <Logo className="h-10" />
            <span className="eyebrow text-[0.65rem] text-muted-foreground">Admin</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/" className="hover:text-primary">
              View store
            </Link>
            {auth.signedIn && (
              <button
                type="button"
                onClick={async () => {
                  await adminLogoutFn();
                  await router.invalidate();
                }}
                className="inline-flex items-center gap-1.5 hover:text-primary"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            )}
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-7xl px-5 py-10 lg:px-10">
        {!auth.configured ? (
          <NotConfigured />
        ) : !auth.signedIn ? (
          <Login />
        ) : (
          <>
            <nav aria-label="Admin sections" className="flex gap-1 overflow-x-auto border-b">
              {TABS.map((t) => (
                <Link
                  key={t}
                  to="/admin"
                  search={{ tab: t === "orders" ? undefined : t, status: undefined }}
                  className={cn(
                    "-mb-px border-b-2 px-4 py-3 text-sm font-medium capitalize",
                    tab === t
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t}
                </Link>
              ))}
            </nav>
            <div className="mt-8">
              {tab === "orders" && <Orders data={orders} status={status} />}
              {tab === "enquiries" && <Enquiries data={enquiries} />}
              {tab === "catalogue" && <Catalogue />}
              {tab === "settings" && <Settings />}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function NotConfigured() {
  return (
    <div className="mx-auto max-w-xl rounded-lg border bg-background p-8">
      <ShieldAlert className="h-8 w-8 text-primary" />
      <h1 className="display mt-4 text-4xl">Admin access isn't configured</h1>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        For security the admin area stays locked until the server has an{" "}
        <code className="rounded bg-muted px-1">ADMIN_PASSWORD</code> and a{" "}
        <code className="rounded bg-muted px-1">SESSION_SECRET</code> of at least 32 characters. See{" "}
        <strong>docs/SETUP.md</strong>.
      </p>
    </div>
  );
}

function Login() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password") ?? "");
    if (!password) return setError("Enter the admin password.");
    setBusy(true);
    const r = await adminLoginFn({ data: { password } }).catch(() => ({
      ok: false as const,
      error: "Sign-in failed. Try again.",
    }));
    setBusy(false);
    if (!r.ok) return setError(r.error);
    await router.invalidate();
  };
  return (
    <form onSubmit={submit} className="mx-auto max-w-sm rounded-lg border bg-background p-8">
      <h1 className="display text-4xl">Sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">Store administration.</p>
      <label htmlFor="password" className="mt-6 block text-sm font-medium">
        Admin password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "pw-err" : undefined}
        className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
      />
      {error && (
        <p id="pw-err" role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="btn-primary mt-6 w-full justify-center rounded-lg"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
      </button>
    </form>
  );
}

function Orders({
  data,
  status,
}: {
  data: { storage: string | null; orders: PublicOrder[] } | null;
  status: OrderStatus | undefined;
}) {
  if (!data)
    return (
      <p className="text-sm text-destructive">
        Couldn't load orders. Your session may have expired — refresh to sign in again.
      </p>
    );
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="display text-4xl">Orders</h1>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            to="/admin"
            search={{ tab: undefined, status: undefined }}
            className={chip(!status)}
          >
            All
          </Link>
          {ORDER_STATUSES.map((s) => (
            <Link
              key={s}
              to="/admin"
              search={{ tab: undefined, status: s }}
              className={chip(status === s)}
            >
              {ORDER_STATUS_LABELS[s]}
            </Link>
          ))}
        </div>
      </div>
      {data.storage === "memory" && (
        <p className="mt-3 text-xs text-muted-foreground">
          Development store — orders live in server memory and reset on restart.
        </p>
      )}
      {data.storage === null && (
        <p className="mt-3 text-sm text-destructive">
          Order storage isn't configured (set the Supabase variables), so no orders can be saved
          yet.
        </p>
      )}
      {data.orders.length === 0 ? (
        <p className="mt-10 rounded-lg border border-dashed bg-background p-10 text-center text-muted-foreground">
          No orders {status ? `with status “${ORDER_STATUS_LABELS[status]}”` : "yet"}.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {data.orders.map((o) => (
            <OrderRow key={o.orderNumber} order={o} />
          ))}
        </ul>
      )}
    </div>
  );
}

const chip = (on: boolean) =>
  cn(
    "rounded-full border px-3 py-1.5 text-xs",
    on
      ? "border-primary bg-primary text-primary-foreground"
      : "bg-background hover:border-foreground",
  );

function OrderRow({ order }: { order: PublicOrder }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const next = ADMIN_TRANSITIONS[order.status];
  const run = async (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setBusy(true);
    setError(null);
    const r = await fn().catch(() => ({ ok: false, error: "Request failed." }));
    setBusy(false);
    if (!r.ok) setError(r.error ?? "Update failed.");
    else await router.invalidate();
  };
  const f = order.fulfilment;
  return (
    <li className="rounded-lg border bg-background">
      <details className="group">
        <summary className="grid cursor-pointer list-none gap-2 p-4 text-sm sm:grid-cols-[1.2fr_1.2fr_1fr_auto_auto] sm:items-center [&::-webkit-details-marker]:hidden">
          <span>
            <span className="font-semibold">{order.orderNumber}</span>
            {order.demo && (
              <span className="ml-2 rounded bg-secondary px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                demo items
              </span>
            )}
            <span className="block text-xs text-muted-foreground">
              {new Date(order.createdAt).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </span>
          <span>
            {order.customer.name}
            <span className="block text-xs text-muted-foreground">
              +91 {order.customer.phone} · {fulfilmentLabel(f)}
            </span>
          </span>
          <span className="text-xs">
            {PAYMENT_METHOD_LABELS[order.paymentMethod]}
            <span className="block font-medium">Payment: {order.paymentStatus}</span>
          </span>
          <span className="font-semibold tabular-nums">
            {formatINR(order.total)}
            {order.shipping === null && (
              <span className="block text-[11px] font-normal text-muted-foreground">
                + delivery TBC
              </span>
            )}
          </span>
          <span className="flex items-center gap-2">
            <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
              {ORDER_STATUS_LABELS[order.status]}
            </span>
            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
          </span>
        </summary>
        <div className="grid gap-6 border-t p-4 text-sm lg:grid-cols-[1.4fr_1fr]">
          <div>
            <ul className="divide-y">
              {order.items.map((i) => (
                <li key={`${i.sku}`} className="flex justify-between gap-3 py-2">
                  <span>
                    {i.name}{" "}
                    <span className="text-muted-foreground">
                      · {i.colour} · {i.size} · ×{i.qty} · {i.sku}
                    </span>
                  </span>
                  <span className="tabular-nums">{formatINR(i.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-muted-foreground">
              {f.kind === "delivery"
                ? `Deliver to: ${[f.address.line1, f.address.line2, f.address.city, f.address.state, f.address.pin].filter(Boolean).join(", ")}`
                : `Pickup: ${f.city}`}
            </p>
            {order.customer.email && (
              <p className="text-muted-foreground">Email: {order.customer.email}</p>
            )}
            {order.notes && <p className="text-muted-foreground">Note: {order.notes}</p>}
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {next.length === 0 && (
                <p className="text-muted-foreground">No further status changes.</p>
              )}
              {next.map((to) => (
                <button
                  key={to}
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    run(() => adminUpdateStatusFn({ data: { orderNumber: order.orderNumber, to } }))
                  }
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs font-medium hover:border-foreground disabled:opacity-50",
                    to === "cancelled" && "text-destructive",
                  )}
                >
                  Mark {ORDER_STATUS_LABELS[to].toLowerCase()}
                </button>
              ))}
              {order.paymentMethod !== "razorpay" &&
                order.paymentStatus === "unpaid" &&
                !["cancelled"].includes(order.status) && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      run(() =>
                        adminMarkCashCollectedFn({ data: { orderNumber: order.orderNumber } }),
                      )
                    }
                    className="rounded-lg border border-primary px-3 py-2 text-xs font-medium text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
                  >
                    Cash collected
                  </button>
                )}
            </div>
            {order.paymentMethod === "razorpay" && (
              <p className="text-xs text-muted-foreground">
                Online payments are confirmed automatically by Razorpay verification. Process
                refunds in the Razorpay Dashboard, then mark the order refunded.
              </p>
            )}
            <a
              href={`https://wa.me/91${order.customer.phone}?text=${encodeURIComponent(`Hello ${order.customer.name.split(" ")[0]}, this is DB Hub about your order ${order.orderNumber}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs font-medium text-primary underline"
            >
              WhatsApp the customer
            </a>
            {error && (
              <p role="alert" className="text-xs text-destructive">
                {error}
              </p>
            )}
          </div>
        </div>
      </details>
    </li>
  );
}

function Enquiries({ data }: { data: Awaited<ReturnType<typeof adminEnquiriesFn>> | null }) {
  if (!data)
    return (
      <p className="text-sm text-destructive">Couldn't load enquiries. Refresh to sign in again.</p>
    );
  return (
    <div>
      <h1 className="display text-4xl">Wholesale enquiries</h1>
      {data.length === 0 ? (
        <p className="mt-10 rounded-lg border border-dashed bg-background p-10 text-center text-muted-foreground">
          No enquiries yet.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {data.map((e) => (
            <li key={e.id} className="rounded-lg border bg-background p-4 text-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold">
                  {e.name}
                  {e.business && (
                    <span className="font-normal text-muted-foreground"> · {e.business}</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(e.createdAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <p className="mt-1">
                +91 {e.phone} · {e.quantity}
                {e.categories.length > 0 && ` · ${e.categories.join(", ")}`}
              </p>
              {e.message && <p className="mt-2 text-muted-foreground">{e.message}</p>}
              <a
                href={`https://wa.me/91${e.phone}?text=${encodeURIComponent(`Hello ${e.name.split(" ")[0]}, thanks for your wholesale enquiry with DB Hub.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs font-medium text-primary underline"
              >
                Reply on WhatsApp
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Catalogue() {
  return (
    <div>
      <h1 className="display text-4xl">Catalogue</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Read-only view. Products are edited in{" "}
        <code className="rounded bg-muted px-1">src/lib/catalog/products.ts</code> (see
        docs/CATALOGUE.md); an in-browser product editor needs the database-backed catalogue
        described there. {CATALOGUE_IS_DEMO && "Entries marked demo are illustrative starter data."}
      </p>
      <div className="mt-6 overflow-x-auto rounded-lg border bg-background">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Flags</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {ACTIVE_PRODUCTS.map((p) => (
              <tr key={p.id}>
                <td className="p-3">
                  <Link
                    to="/products/$slug"
                    params={{ slug: p.slug }}
                    className="font-medium hover:text-primary"
                  >
                    {p.name}
                  </Link>
                  <span className="block text-xs text-muted-foreground">
                    {p.variants.length} variants
                  </span>
                </td>
                <td className="p-3">{categoryName(p.category)}</td>
                <td className="p-3 tabular-nums">{formatINR(p.price)}</td>
                <td className="p-3 tabular-nums">
                  {totalStock(p)}
                  {p.variants.some((v) => v.stock === 0) && (
                    <span className="block text-xs text-destructive">
                      {p.variants.filter((v) => v.stock === 0).length} sold out
                    </span>
                  )}
                </td>
                <td className="p-3 text-xs">
                  {[
                    p.demo && "demo",
                    p.featured && "featured",
                    p.newArrival && "new",
                    p.budgetEdit && "budget edit",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Settings() {
  const rows: [string, string][] = [
    ["WhatsApp orders go to", `+${CONTACT.whatsapp}`],
    ["Phone numbers", `${CONTACT.primary.display}, ${CONTACT.alternate.display}`],
    [
      "Delivery charge",
      SHIPPING.flatFee === null ? "Not set — confirmed per order" : formatINR(SHIPPING.flatFee),
    ],
    ["Cash on delivery", PAYMENTS.cod ? "On" : "Off"],
    ["Pay at store", PAYMENTS.payAtStore ? "On" : "Off"],
    ["Online payments (Razorpay)", PAYMENTS.razorpay ? "Enabled when server keys are set" : "Off"],
  ];
  return (
    <div>
      <h1 className="display text-4xl">Settings</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        These values live in <code className="rounded bg-muted px-1">src/config/site.ts</code>{" "}
        (announcements, numbers, shipping, payment switches). Secrets live in server environment
        variables — see docs/SETUP.md.
      </p>
      <dl className="mt-6 divide-y rounded-lg border bg-background text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="grid gap-1 p-4 sm:grid-cols-[16rem_1fr]">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="font-medium">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
