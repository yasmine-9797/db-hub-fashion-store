import { createFileRoute } from "@tanstack/react-router";
import {
  ContentPage,
  LastUpdated,
  PolicyContact,
  Prose,
  ToConfirm,
} from "@/components/content/ContentPage";
import { POLICIES_APPROVED } from "@/config/site";
import { breadcrumbJsonLd, seo } from "@/lib/seo";

export const Route = createFileRoute("/policies/privacy")({
  head: () =>
    seo({
      title: "Privacy policy",
      description:
        "What information DB Hub Cloth Store collects through this website, how it is used, how payments are handled by Razorpay, and how to ask for your data to be accessed or deleted.",
      path: "/policies/privacy",
      jsonLd: breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Privacy policy", path: "/policies/privacy" },
      ]),
    }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <ContentPage
      eyebrow="Policies"
      title="Privacy policy"
      intro="What information DB Hub Cloth Store collects through this website, how we use it, and the choices you have."
      crumbs={[{ label: "Home", to: "/" }, { label: "Privacy policy" }]}
      draft={!POLICIES_APPROVED}
    >
      <LastUpdated />
      <Prose className="mt-10">
        <h2>Information you give us</h2>
        <h3>When you place an order</h3>
        <p>Checkout asks for:</p>
        <ul>
          <li>your name and mobile number;</li>
          <li>your email address, if you choose to give it;</li>
          <li>your delivery address, if you choose home delivery;</li>
          <li>an optional note about your order.</li>
        </ul>
        <p>
          We also keep the details of the order itself: the items, sizes, colours, quantities and
          prices, whether you chose delivery or store pickup, your payment method and the order's
          status.
        </p>

        <h3>When you send a wholesale enquiry</h3>
        <p>
          The wholesale enquiry form asks for your name, mobile number, business name (optional),
          approximate quantity, the categories you're interested in and a message.
        </p>

        <h3>When you contact us on WhatsApp, by phone or on Instagram</h3>
        <p>
          We see the information you share with us, such as your number and your messages. WhatsApp
          and Instagram are run by Meta, and their own privacy policies apply to those services.
        </p>

        <h2>Payments</h2>
        <p>
          Online payments are processed by Razorpay. Card, UPI, net banking and wallet details are
          entered in Razorpay's own secure window — they are never entered on, or stored by, this
          site. Razorpay tells us whether a payment succeeded, with a payment reference and the
          amount, so we can match it to your order. Razorpay's handling of your information is
          described in the{" "}
          <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer">
            Razorpay privacy policy
          </a>
          .
        </p>

        <h2>Information stored in your browser</h2>
        <p>There are no customer accounts on this site. Instead:</p>
        <ul>
          <li>
            <strong>Bag and wishlist.</strong> These are saved in your browser's local storage on
            this device, so they're still there when you come back. Your wishlist stays on your
            device; the items in your bag are sent to us only when you place an order.
          </li>
          <li>
            <strong>Checkout reference.</strong> While you check out, a temporary reference is kept
            in your browser's session storage so that retrying doesn't create a duplicate order. It
            is cleared when you close the tab.
          </li>
        </ul>
        <p>
          You can remove this information at any time by emptying your bag and wishlist or clearing
          this site's data in your browser.
        </p>
        <p>
          <ToConfirm>
            [To be confirmed by DB Hub: any analytics, advertising or other cookies used on the
            site]
          </ToConfirm>
        </p>

        <h2>How we use your information</h2>
        <ul>
          <li>
            to process, confirm and fulfil your order, including home delivery or store pickup;
          </li>
          <li>to contact you by phone, WhatsApp or email about your order;</li>
          <li>to take and verify online payments;</li>
          <li>to reply to wholesale enquiries and other questions.</li>
        </ul>
        <p>
          <ToConfirm>
            [To be confirmed by DB Hub: whether customers will receive marketing messages, and how
            to opt out]
          </ToConfirm>
        </p>

        <h2>Who we share it with</h2>
        <ul>
          <li>
            <strong>Razorpay</strong>, to process online payments.
          </li>
          <li>
            <strong>Delivery partners</strong>, who receive the name, phone number and address
            needed to deliver your order.{" "}
            <ToConfirm>[To be confirmed by DB Hub: delivery/courier partners used]</ToConfirm>
          </li>
          <li>
            <strong>Service providers</strong> that host this website and store its order and
            enquiry records.{" "}
            <ToConfirm>[To be confirmed by DB Hub: hosting and database providers]</ToConfirm>
          </li>
          <li>
            <strong>Authorities</strong>, where we are required to by law.
          </li>
        </ul>
        <p>
          <strong>We do not sell your personal information.</strong>
        </p>

        <h2>How long we keep it</h2>
        <p>
          <ToConfirm>
            [To be confirmed by DB Hub: data retention period for order and enquiry records]
          </ToConfirm>
        </p>

        <h2>Your choices</h2>
        <p>
          You can ask us for a copy of the information we hold about you, or ask us to correct or
          delete it, by contacting us using the details below. We may need to keep some order
          records where the law requires it.
        </p>
        <p>
          <ToConfirm>
            [To be confirmed by DB Hub: name or role of the person who handles privacy requests]
          </ToConfirm>
        </p>

        <h2>Changes to this policy</h2>
        <p>If we change this policy, we'll update this page and the "Last updated" date above.</p>

        <h2>Contact us</h2>
        <PolicyContact topic="privacy policy" />
      </Prose>
    </ContentPage>
  );
}
