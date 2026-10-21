import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ContentPage,
  LastUpdated,
  PolicyContact,
  Prose,
  ToConfirm,
} from "@/components/content/ContentPage";
import { POLICIES_APPROVED } from "@/config/site";
import { CATALOGUE_IS_DEMO } from "@/lib/catalog";
import { breadcrumbJsonLd, seo } from "@/lib/seo";

export const Route = createFileRoute("/policies/terms")({
  head: () =>
    seo({
      title: "Terms & conditions",
      description:
        "Terms for using the DB Hub Cloth Store website and placing orders online or on WhatsApp — pricing in INR, availability, order acceptance and payment through Razorpay.",
      path: "/policies/terms",
      jsonLd: breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Terms & conditions", path: "/policies/terms" },
      ]),
    }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <ContentPage
      eyebrow="Policies"
      title="Terms & conditions"
      intro="These terms apply when you use this website or place an order with DB Hub Cloth Store, online or on WhatsApp."
      crumbs={[{ label: "Home", to: "/" }, { label: "Terms & conditions" }]}
      draft={!POLICIES_APPROVED}
    >
      <LastUpdated />
      <Prose className="mt-10">
        <h2>About us</h2>
        <p>
          This website is run by DB Hub Cloth Store, which has stores in Chennai and Coimbatore,
          Tamil Nadu.
        </p>
        <p>
          <ToConfirm>
            [To be confirmed by DB Hub: registered business name, address and GSTIN, if applicable]
          </ToConfirm>
        </p>

        <h2>Products and the online catalogue</h2>
        {CATALOGUE_IS_DEMO && (
          <p>
            Our online catalogue is still being set up. Some products and photos currently shown are
            illustrative examples while real stock is added, and may not be available to buy. Please
            confirm availability with us before ordering.
          </p>
        )}
        <p>
          All items are subject to availability. Colours can look different on different screens,
          and our imported and surplus range changes as stock comes and goes.
        </p>

        <h2>Prices</h2>
        <p>
          All prices are in Indian Rupees (INR). Delivery charges, where they apply, are confirmed
          by our team and are not included in product prices.
        </p>
        <p>
          <ToConfirm>[To be confirmed by DB Hub: whether prices include GST]</ToConfirm>
        </p>

        <h2>Orders</h2>
        <p>
          Placing an order on this website, or sending an order on WhatsApp, is a request to buy. An
          order is accepted once our team confirms it with you. Until then we may decline or cancel
          an order — for example, if an item is unavailable or a price or description was listed in
          error — and we'll let you know if we do.
        </p>
        <p>
          <ToConfirm>
            [To be confirmed by DB Hub: how payments are refunded for orders we cancel]
          </ToConfirm>
        </p>

        <h2>Payment</h2>
        <p>You can pay by:</p>
        <ul>
          <li>
            online payment through Razorpay (UPI, cards, net banking and wallets), where available
            at checkout;
          </li>
          <li>cash on delivery, for home delivery orders;</li>
          <li>paying at the store, for store pickup orders;</li>
          <li>confirming your order on WhatsApp and paying after our team confirms it.</li>
        </ul>
        <p>
          Online payments are processed by Razorpay and are also subject to Razorpay's terms. Card
          and UPI details are entered in Razorpay's secure window and are never stored by this site.
        </p>

        <h2>Delivery and pickup</h2>
        <p>
          We deliver across India and offer free store pickup in Chennai and Coimbatore. See our{" "}
          <Link to="/policies/shipping">shipping policy</Link>.
        </p>

        <h2>Returns and refunds</h2>
        <p>
          See our <Link to="/policies/returns">returns policy</Link>.
        </p>

        <h2>Wholesale</h2>
        <p>Wholesale orders, prices and quantities are agreed directly with our team.</p>
        <p>
          <ToConfirm>
            [To be confirmed by DB Hub: wholesale terms, such as payment and minimum quantities]
          </ToConfirm>
        </p>

        <h2>Using this website</h2>
        <p>
          Please use this website only for lawful purposes, don't try to interfere with how it
          works, and don't copy its content for commercial use without our permission. How we handle
          your information is explained in our <Link to="/policies/privacy">privacy policy</Link>.
        </p>

        <h2>Liability</h2>
        <p>
          <ToConfirm>[To be confirmed by DB Hub: limitation of liability]</ToConfirm>
        </p>

        <h2>Governing law</h2>
        <p>
          <ToConfirm>[To be confirmed: governing law/jurisdiction]</ToConfirm>
        </p>

        <h2>Changes to these terms</h2>
        <p>
          We may update these terms from time to time. The terms on this page when you place an
          order apply to that order.
        </p>

        <h2>Contact us</h2>
        <PolicyContact topic="terms and conditions" />
      </Prose>
    </ContentPage>
  );
}
