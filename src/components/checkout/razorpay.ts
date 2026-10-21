/**
 * Browser side of Razorpay Checkout. Card/UPI details are entered in Razorpay's own secure window —
 * this site never sees or stores them. Success here is only a claim; the server verifies it.
 */
import logo from "@/assets/logo.png";
import { SITE } from "@/config/site";

type RazorpaySuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};
type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", cb: (r: { error?: { description?: string } }) => void) => void;
};
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

let loading: Promise<boolean> | null = null;

export function loadRazorpay(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  loading ??= new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve(Boolean(window.Razorpay));
    s.onerror = () => {
      loading = null;
      resolve(false);
    };
    document.head.appendChild(s);
  });
  return loading;
}

export type RazorpayOutcome =
  | { kind: "success"; response: RazorpaySuccess }
  | { kind: "failed"; message: string }
  | { kind: "dismissed" }
  | { kind: "unavailable" };

export async function openRazorpay(p: {
  keyId: string;
  razorpayOrderId: string;
  amountPaise: number;
  orderNumber: string;
  prefill: { name: string; contact: string; email?: string | undefined };
  onAttemptFailed?: (message: string) => void;
}): Promise<RazorpayOutcome> {
  if (!(await loadRazorpay()) || !window.Razorpay) return { kind: "unavailable" };
  return new Promise((resolve) => {
    let settled = false;
    // Razorpay keeps its window open after a failed attempt so the customer can try another
    // method; we only settle on success or when they close the window.
    let lastError: string | null = null;
    const done = (o: RazorpayOutcome) => {
      if (!settled) {
        settled = true;
        resolve(o);
      }
    };
    const rzp = new window.Razorpay!({
      key: p.keyId,
      order_id: p.razorpayOrderId,
      amount: p.amountPaise,
      currency: "INR",
      name: SITE.name,
      description: `Order ${p.orderNumber}`,
      image: new URL(logo, window.location.origin).href,
      prefill: p.prefill,
      notes: { orderNumber: p.orderNumber },
      theme: { color: "#80002A" },
      handler: (response: RazorpaySuccess) => done({ kind: "success", response }),
      modal: {
        ondismiss: () =>
          done(lastError ? { kind: "failed", message: lastError } : { kind: "dismissed" }),
        confirm_close: true,
      },
    });
    rzp.on("payment.failed", (r) => {
      lastError = r.error?.description ?? "The payment did not go through.";
      p.onAttemptFailed?.(lastError);
    });
    rzp.open();
  });
}
