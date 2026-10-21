import { useNavigate } from "@tanstack/react-router";
import { openRazorpay } from "@/components/checkout/razorpay";
import type { RazorpayCheckout } from "@/lib/orders";
import { reportPaymentFailureFn, verifyPaymentFn } from "@/lib/api";

/**
 * Opens Razorpay for an order, then asks the server to verify the result. The order page is only
 * shown as paid when the server confirms it — the browser's "success" callback is not trusted.
 */
export function useOnlinePayment() {
  const navigate = useNavigate();
  return async (orderNumber: string, token: string, rz: RazorpayCheckout) => {
    const outcome = await openRazorpay({
      ...rz,
      orderNumber,
      onAttemptFailed: () =>
        void reportPaymentFailureFn({ data: { orderNumber, token } }).catch(() => {}),
    });
    const toStatus = (result: "failed" | "cancelled" | "pending" | "unavailable") =>
      navigate({ to: "/payment-status", search: { order: orderNumber, token, result } });

    if (outcome.kind === "success") {
      const r = outcome.response;
      const verified = await verifyPaymentFn({
        data: {
          orderNumber,
          token,
          razorpayOrderId: r.razorpay_order_id,
          razorpayPaymentId: r.razorpay_payment_id,
          razorpaySignature: r.razorpay_signature,
        },
      }).catch(() => null);
      if (verified?.ok && verified.order.status === "paid")
        return navigate({ to: "/order/$orderNumber", params: { orderNumber }, search: { token } });
      return toStatus(verified?.ok ? "pending" : "failed");
    }
    if (outcome.kind === "failed") return toStatus("failed");
    if (outcome.kind === "dismissed") return toStatus("cancelled");
    return toStatus("unavailable");
  };
}
