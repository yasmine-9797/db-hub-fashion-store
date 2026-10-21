import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ContentPage,
  LastUpdated,
  PolicyContact,
  Prose,
  ToConfirm,
} from "@/components/content/ContentPage";
import { CONTACT, POLICIES_APPROVED } from "@/config/site";
import { breadcrumbJsonLd, seo } from "@/lib/seo";

export const Route = createFileRoute("/policies/returns")({
  head: () =>
    seo({
      title: "Returns & refunds policy",
      description:
        "Returns, exchanges and refunds at DB Hub Cloth Store — how to start a return and what to do if an item arrives damaged or incorrect.",
      path: "/policies/returns",
      jsonLd: breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Returns & refunds", path: "/policies/returns" },
      ]),
    }),
  component: ReturnsPolicyPage,
});

function ReturnsPolicyPage() {
  return (
    <ContentPage
      eyebrow="Policies"
      title="Returns & refunds"
      intro="How returns, exchanges and refunds work for orders placed with DB Hub Cloth Store."
      crumbs={[{ label: "Home", to: "/" }, { label: "Returns & refunds" }]}
      draft={!POLICIES_APPROVED}
    >
      <LastUpdated />
      <Prose className="mt-10">
        <h2>Return and exchange window</h2>
        <p>
          <ToConfirm>[To be confirmed by DB Hub: return window]</ToConfirm>
        </p>

        <h2>Conditions</h2>
        <p>
          <ToConfirm>
            [To be confirmed by DB Hub: conditions for returns, such as item condition, tags and
            packaging]
          </ToConfirm>
        </p>

        <h2>Items that can't be returned</h2>
        <p>
          <ToConfirm>[To be confirmed by DB Hub: non-returnable items, if any]</ToConfirm>
        </p>

        <h2>Exchanges</h2>
        <p>
          <ToConfirm>
            [To be confirmed by DB Hub: whether size or colour exchanges are offered, and how]
          </ToConfirm>
        </p>

        <h2>How to start a return or exchange</h2>
        <ol>
          <li>
            Contact us on WhatsApp or call{" "}
            <a href={`tel:${CONTACT.primary.tel}`}>{CONTACT.primary.display}</a> or{" "}
            <a href={`tel:${CONTACT.alternate.tel}`}>{CONTACT.alternate.display}</a>.
          </li>
          <li>
            Share your order number (or, for a WhatsApp order, the name and mobile number you
            ordered with), the item(s) and the reason.
          </li>
          <li>Our team will explain the next steps.</li>
        </ol>
        <p>Please contact us before sending anything back.</p>

        <h2>Return shipping</h2>
        <p>
          <ToConfirm>
            [To be confirmed by DB Hub: who pays for return shipping, and whether items can be
            returned at a store]
          </ToConfirm>
        </p>

        <h2>Refunds</h2>
        <p>
          <strong>Refund method:</strong>{" "}
          <ToConfirm>
            [To be confirmed by DB Hub: refund method — for example, to the original payment method
            or as store credit]
          </ToConfirm>
        </p>
        <p>
          <strong>Refund timeline:</strong>{" "}
          <ToConfirm>[To be confirmed by DB Hub: refund timeline]</ToConfirm>
        </p>

        <h2>Damaged, defective or incorrect items</h2>
        <p>
          If an item arrives damaged or defective, or isn't what you ordered, contact us as soon as
          possible with your order number and photos of the item.
        </p>
        <p>
          <ToConfirm>
            [To be confirmed by DB Hub: time limit for reporting damaged or incorrect items, and how
            they are resolved]
          </ToConfirm>
        </p>

        <h2>Cancellations</h2>
        <p>If you want to cancel an order, contact us as soon as possible.</p>
        <p>
          <ToConfirm>
            [To be confirmed by DB Hub: cancellation policy, including orders already paid online]
          </ToConfirm>
        </p>

        <h2>Wholesale orders</h2>
        <p>
          <ToConfirm>
            [To be confirmed by DB Hub: whether and how returns apply to wholesale orders]
          </ToConfirm>
        </p>

        <h2>Questions</h2>
        <p>
          See also our <Link to="/policies/shipping">shipping policy</Link>, or get in touch:
        </p>
        <PolicyContact topic="returns policy" />
      </Prose>
    </ContentPage>
  );
}
