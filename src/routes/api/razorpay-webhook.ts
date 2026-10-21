import { createFileRoute } from "@tanstack/react-router";
import { handleRazorpayWebhook } from "@/server/orders.server";

/**
 * Razorpay webhook endpoint: POST https://<your-domain>/api/razorpay-webhook
 * Subscribe to payment.captured, payment.failed and order.paid in the Razorpay Dashboard and set
 * RAZORPAY_WEBHOOK_SECRET to the same secret. Requests with a bad signature are rejected.
 */
export const Route = createFileRoute("/api/razorpay-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const result = await handleRazorpayWebhook(
          await request.text(),
          request.headers.get("x-razorpay-signature"),
        );
        return new Response(result.body, {
          status: result.status,
          headers: { "Content-Type": "text/plain" },
        });
      },
    },
  },
});
