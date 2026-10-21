import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ContentPage,
  LastUpdated,
  PolicyContact,
  Prose,
  ToConfirm,
} from "@/components/content/ContentPage";
import { POLICIES_APPROVED, STORES } from "@/config/site";
import { breadcrumbJsonLd, seo } from "@/lib/seo";

export const Route = createFileRoute("/policies/shipping")({
  head: () =>
    seo({
      title: "Shipping policy",
      description:
        "How home delivery across India and free store pickup in Chennai and Coimbatore work for DB Hub Cloth Store orders, including how delivery charges are confirmed.",
      path: "/policies/shipping",
      jsonLd: breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Shipping policy", path: "/policies/shipping" },
      ]),
    }),
  component: ShippingPolicyPage,
});

function ShippingPolicyPage() {
  return (
    <ContentPage
      eyebrow="Policies"
      title="Shipping policy"
      intro="How home delivery and store pickup work for orders placed with DB Hub Cloth Store, on this website or on WhatsApp."
      crumbs={[{ label: "Home", to: "/" }, { label: "Shipping policy" }]}
      draft={!POLICIES_APPROVED}
    >
      <LastUpdated />
      <Prose className="mt-10">
        <h2>Where we deliver</h2>
        <p>
          We deliver to addresses across India. You can also collect your order for free from our
          stores in Chennai and Coimbatore.
        </p>

        <h2>Order confirmation</h2>
        <p>
          After you place an order, our team contacts you by phone or WhatsApp to confirm your order
          and delivery details.
        </p>

        <h2>Delivery charges</h2>
        <p>
          Delivery charges are confirmed by our team when they confirm your order, and are shown
          separately from product prices.
        </p>
        <p>
          <ToConfirm>
            [To be confirmed by DB Hub: delivery charges and any free-delivery threshold]
          </ToConfirm>
        </p>

        <h2>Delivery timelines</h2>
        <p>Our team will tell you the expected delivery timeline when confirming your order.</p>
        <p>
          <ToConfirm>
            [To be confirmed by DB Hub: order processing time and typical delivery timelines]
          </ToConfirm>
        </p>

        <h2>Couriers and tracking</h2>
        <p>
          <ToConfirm>
            [To be confirmed by DB Hub: courier partners used and whether tracking details are
            shared]
          </ToConfirm>
        </p>

        <h2>Cash on delivery</h2>
        <p>Cash on delivery is available for home delivery orders.</p>
        <p>
          <ToConfirm>
            [To be confirmed by DB Hub: any limits or extra charges for cash on delivery]
          </ToConfirm>
        </p>

        <h2>Free store pickup</h2>
        <p>
          Store pickup is free. Choose store pickup at checkout and select your store, then pay at
          the store when you collect (or online, where available).
        </p>
        <ul>
          {STORES.map((s) => (
            <li key={s.city}>
              <strong>{s.city}:</strong> {s.address}
            </li>
          ))}
        </ul>
        <p>
          Please call ahead to confirm opening hours. Directions and phone numbers are on our{" "}
          <Link to="/contact">contact page</Link>.
        </p>
        <p>
          <ToConfirm>
            [To be confirmed by DB Hub: how customers are told a pickup order is ready, and how long
            it is held]
          </ToConfirm>
        </p>

        <h2>Delayed, damaged or incorrect parcels</h2>
        <p>
          If your parcel is delayed, arrives damaged or contains the wrong item, contact us on
          WhatsApp or by phone with your order number. See our{" "}
          <Link to="/policies/returns">returns policy</Link> for more.
        </p>
        <p>
          <ToConfirm>
            [To be confirmed by DB Hub: time limit for reporting damaged or incorrect parcels]
          </ToConfirm>
        </p>

        <h2>Questions</h2>
        <PolicyContact topic="shipping policy" />
      </Prose>
    </ContentPage>
  );
}
