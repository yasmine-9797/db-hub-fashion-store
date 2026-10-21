import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown, Phone } from "lucide-react";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { ContentPage } from "@/components/content/ContentPage";
import { CONTACT } from "@/config/site";
import { CATALOGUE_IS_DEMO, CATEGORIES } from "@/lib/catalog";
import { breadcrumbJsonLd, seo } from "@/lib/seo";

export const Route = createFileRoute("/faq")({
  head: () =>
    seo({
      title: "FAQ",
      description:
        "Answers to common questions about ordering, payments, delivery across India, free store pickup in Chennai and Coimbatore, sizes, returns and wholesale at DB Hub Cloth Store.",
      path: "/faq",
      jsonLd: breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "FAQ", path: "/faq" },
      ]),
    }),
  component: FaqPage,
});

type Faq = { q: string; a: ReactNode };
type Group = { id: string; title: string; items: Faq[] };

const call = <a href={`tel:${CONTACT.primary.tel}`}>{CONTACT.primary.display}</a>;
const whatsapp = (message: string) => (
  <WhatsAppButton variant="link" message={message}>
    WhatsApp
  </WhatsAppButton>
);
const instagram = (
  <a href={CONTACT.instagram.url} target="_blank" rel="noopener noreferrer">
    {CONTACT.instagram.handle}
  </a>
);

const GROUPS: Group[] = [
  {
    id: "ordering",
    title: "Ordering",
    items: [
      {
        q: "How do I place an order?",
        a: (
          <p>
            Add pieces to your bag and go to <Link to="/checkout">checkout</Link>, or choose “Order
            on WhatsApp” from your <Link to="/cart">bag</Link> to send the list to our team. You can
            also message us about any product on{" "}
            {whatsapp("Hello DB Hub! I'd like to place an order.")}, or visit our stores in Chennai
            and Coimbatore.
          </p>
        ),
      },
      {
        q: "Do I need an account to order?",
        a: (
          <p>
            No — there are no customer accounts. Your bag and wishlist are saved in this browser on
            this device, so they won't appear on another phone or computer.
          </p>
        ),
      },
      {
        q: "How do I know my order has been received?",
        a: (
          <p>
            After you place an order at checkout you'll see your order number and a private order
            page you can bookmark to check its status. Our team will contact you by phone or
            WhatsApp to confirm your order.
          </p>
        ),
      },
      {
        q: "Is ordering on WhatsApp different from ordering on the website?",
        a: (
          <p>
            A WhatsApp order is an enquiry: our team confirms availability, the final price and
            delivery details with you before you pay.
          </p>
        ),
      },
    ],
  },
  {
    id: "payments",
    title: "Payments",
    items: [
      {
        q: "Which payment methods do you accept?",
        a: (
          <>
            <p>At checkout you can choose from:</p>
            <ul>
              <li>
                <strong>Online payment through Razorpay</strong> — UPI, cards, net banking and
                wallets, where it's available at checkout.
              </li>
              <li>
                <strong>Cash on delivery</strong> for home delivery orders.
              </li>
              <li>
                <strong>Pay at the store</strong> when you collect a store pickup order.
              </li>
              <li>
                <strong>Confirm on WhatsApp</strong> — send your order to our team and pay after
                they confirm it.
              </li>
            </ul>
          </>
        ),
      },
      {
        q: "Why can't I see online payment at checkout?",
        a: (
          <p>
            Online payment appears only once it's switched on for the store. While delivery charges
            are being confirmed by our team, online payment may be offered for store pickup only, so
            you're never charged an amount that could change. You can still choose cash on delivery
            or confirm your order on WhatsApp.
          </p>
        ),
      },
      {
        q: "Is it safe to pay online? Do you store my card details?",
        a: (
          <p>
            Online payments are processed by Razorpay. You enter your card or UPI details in
            Razorpay's secure payment window — they are never entered on, or stored by, this site.
          </p>
        ),
      },
      {
        q: "My online payment didn't go through. What should I do?",
        a: (
          <p>
            Message us on {whatsapp("Hello DB Hub! My online payment didn't go through.")} or call{" "}
            {call} with your order number and our team will help.
          </p>
        ),
      },
    ],
  },
  {
    id: "delivery",
    title: "Delivery & pickup",
    items: [
      {
        q: "Do you deliver across India?",
        a: <p>Yes, we deliver to addresses across India.</p>,
      },
      {
        q: "How much does delivery cost, and how long does it take?",
        a: (
          <p>
            Delivery charges and timelines are confirmed by our team when they confirm your order.
            See our <Link to="/policies/shipping">shipping policy</Link> for more.
          </p>
        ),
      },
      {
        q: "Can I collect my order from a store?",
        a: (
          <p>
            Yes — store pickup is free at our Chennai and Coimbatore stores. Choose store pickup at
            checkout, then pay at the store when you collect (or online, where available).
          </p>
        ),
      },
      {
        q: "Where are your stores?",
        a: (
          <p>
            We have stores in Chennai and Coimbatore. Addresses, phone numbers and directions are on
            our <Link to="/contact">contact page</Link>. Please call ahead to confirm opening hours.
          </p>
        ),
      },
    ],
  },
  {
    id: "sizes",
    title: "Sizes & fit",
    items: [
      {
        q: "How do I find my size?",
        a: (
          <p>
            Size guides are available on request. Message us on{" "}
            {whatsapp("Hello DB Hub! Could you share the size guide for a product?")} with the
            product you're interested in and we'll share the size details.
          </p>
        ),
      },
      {
        q: "I'm between sizes — what should I order?",
        a: (
          <p>
            Message us on {whatsapp("Hello DB Hub! I need help choosing a size.")} before ordering
            and our team can help you choose.
          </p>
        ),
      },
    ],
  },
  {
    id: "returns",
    title: "Returns & exchanges",
    items: [
      {
        q: "Can I return or exchange an item?",
        a: (
          <p>
            Our returns and exchanges policy is still being finalised — please read the{" "}
            <Link to="/policies/returns">draft returns policy</Link>. If you need confirmation
            before ordering, message us on{" "}
            {whatsapp("Hello DB Hub! I have a question about returns and exchanges.")} or call{" "}
            {call}.
          </p>
        ),
      },
      {
        q: "How do I start a return or exchange?",
        a: (
          <p>
            Contact us on {whatsapp("Hello DB Hub! I'd like to return or exchange an item.")} or
            call {call} with your order number and the item(s). Our team will explain the next
            steps.
          </p>
        ),
      },
      {
        q: "What if my item arrives damaged or incorrect?",
        a: (
          <p>
            Contact us as soon as possible on WhatsApp or by phone with your order number and photos
            of the item, and our team will help.
          </p>
        ),
      },
    ],
  },
  {
    id: "wholesale",
    title: "Wholesale",
    items: [
      {
        q: "Do you sell wholesale?",
        a: <p>Yes, we sell wholesale as well as retail.</p>,
      },
      {
        q: "Is there a minimum order quantity?",
        a: (
          <p>
            Minimum quantities and wholesale prices aren't listed online. Tell us roughly how many
            pieces you need in your enquiry and our team will discuss options with you.
          </p>
        ),
      },
      {
        q: "How do I send a wholesale enquiry?",
        a: (
          <p>
            Use the <Link to="/wholesale">wholesale enquiry form</Link> — it asks for your name,
            mobile number, business name (optional), approximate quantity, the categories you're
            interested in and a message. You can also message us on{" "}
            {whatsapp("Hello DB Hub! I have a wholesale enquiry.")}.
          </p>
        ),
      },
    ],
  },
  {
    id: "products",
    title: "About our products",
    items: [
      {
        q: "What kind of clothing do you sell?",
        a: (
          <ul>
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link to="/collections/$slug" params={{ slug: c.id }}>
                  {c.name}
                </Link>{" "}
                — {c.description}
              </li>
            ))}
          </ul>
        ),
      },
      {
        q: "What's in the Imported & Surplus range?",
        a: (
          <p>
            A rotating selection of imported finds and surplus lots, so what's available changes.
            Message us on{" "}
            {whatsapp("Hello DB Hub! What imported and surplus pieces do you have right now?")} or
            follow {instagram} on Instagram to see what's in.
          </p>
        ),
      },
      ...(CATALOGUE_IS_DEMO
        ? [
            {
              q: "Is everything on the website available to buy?",
              a: (
                <p>
                  Not yet. Our online catalogue is still being set up, and some products shown are
                  illustrative examples while we add our real stock. Please confirm availability,
                  colour and price with us on WhatsApp or by phone before ordering.
                </p>
              ),
            },
          ]
        : []),
      {
        q: "Where can I see new arrivals?",
        a: (
          <p>
            Browse{" "}
            <Link to="/collections/$slug" params={{ slug: "new-arrivals" }}>
              New Arrivals
            </Link>
            , or follow {instagram} on Instagram.
          </p>
        ),
      },
    ],
  },
];

function FaqPage() {
  return (
    <ContentPage
      eyebrow="Help"
      title="Frequently asked questions"
      intro="Answers to common questions about ordering, payment, delivery, sizes, returns and wholesale. Can't find what you need? Message us on WhatsApp or give us a call."
      crumbs={[{ label: "Home", to: "/" }, { label: "FAQ" }]}
    >
      <nav aria-label="FAQ topics">
        <ul className="flex flex-wrap gap-2">
          {GROUPS.map((g) => (
            <li key={g.id}>
              <a
                href={`#${g.id}`}
                className="inline-block rounded-full border px-4 py-2 text-sm transition-colors hover:border-primary hover:text-primary"
              >
                {g.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {GROUPS.map((g) => (
        <section key={g.id} aria-labelledby={g.id} className="mt-14">
          <h2 id={g.id} className="display scroll-mt-32 text-4xl">
            {g.title}
          </h2>
          <div className="mt-4 divide-y border-y">
            {g.items.map((item) => (
              <Question key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </section>
      ))}

      <section aria-labelledby="more-title" className="mt-16 rounded-lg bg-secondary p-6 sm:p-8">
        <h2 id="more-title" className="display text-3xl">
          Still have a question?
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
          Our team is happy to help on WhatsApp or by phone.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <WhatsAppButton message="Hello DB Hub! I have a question." className="rounded-lg">
            Chat on WhatsApp
          </WhatsAppButton>
          <a href={`tel:${CONTACT.primary.tel}`} className="btn-outline justify-center rounded-lg">
            <Phone className="h-4 w-4" aria-hidden="true" />
            {CONTACT.primary.display}
          </a>
        </div>
      </section>
    </ContentPage>
  );
}

function Question({ q, a }: Faq) {
  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-base font-medium transition-colors hover:text-primary [&::-webkit-details-marker]:hidden">
        {q}
        <ChevronDown
          className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="pb-6 pr-8 text-[15px] leading-relaxed text-muted-foreground [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_li::marker]:text-primary [&_p+p]:mt-3 [&_p+ul]:mt-3 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        {a}
      </div>
    </details>
  );
}
