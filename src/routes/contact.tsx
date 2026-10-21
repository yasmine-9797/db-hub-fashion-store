import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Clock, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { WhatsAppButton, WhatsAppIcon } from "@/components/common/WhatsAppButton";
import { ContentPage } from "@/components/content/ContentPage";
import { CONTACT, STORES, mapsUrl } from "@/config/site";
import { breadcrumbJsonLd, seo } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () =>
    seo({
      title: "Contact us",
      description: `Reach DB Hub Cloth Store on WhatsApp or by phone (${CONTACT.primary.display}), or visit our stores in Chennai and Coimbatore for women's, unisex and Korean-inspired fashion.`,
      path: "/contact",
      jsonLd: breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Contact", path: "/contact" },
      ]),
    }),
  component: ContactPage,
});

/** Widened so the "only when set" check below stays meaningful once an email is added to config. */
const email: string = CONTACT.email;

const card = "rounded-lg border bg-card p-6";
const cardTitle = "display text-3xl";

function ContactPage() {
  return (
    <ContentPage
      eyebrow="Contact"
      title="Contact us"
      intro="WhatsApp is the quickest way to reach us — for questions about a product, sizes, availability or an order. You can also call, message us on Instagram or visit one of our stores."
      crumbs={[{ label: "Home", to: "/" }, { label: "Contact" }]}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <section aria-labelledby="wa-title" className={`${card} sm:col-span-2`}>
          <span className="grid h-11 w-11 place-items-center rounded-full bg-[#1f7a4d]/10">
            <WhatsAppIcon className="h-5 w-5 text-[#1f7a4d]" />
          </span>
          <h2 id="wa-title" className={`${cardTitle} mt-4`}>
            WhatsApp
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
            Message us on {CONTACT.primary.display}. Send a product link or screenshot and we'll
            help with availability, size guides and ordering.
          </p>
          <WhatsAppButton message="Hello DB Hub! I have a question." className="mt-5 rounded-lg">
            Chat on WhatsApp
          </WhatsAppButton>
        </section>

        <section aria-labelledby="call-title" className={card}>
          <h2 id="call-title" className={cardTitle}>
            Call us
          </h2>
          <ul className="mt-4 space-y-3 text-[15px]">
            <li>
              <a
                href={`tel:${CONTACT.primary.tel}`}
                className="inline-flex items-center gap-2 font-medium hover:text-primary"
              >
                <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
                {CONTACT.primary.display}
              </a>
              <span className="block pl-6 text-sm text-muted-foreground">Also on WhatsApp</span>
            </li>
            <li>
              <a
                href={`tel:${CONTACT.alternate.tel}`}
                className="inline-flex items-center gap-2 font-medium hover:text-primary"
              >
                <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
                {CONTACT.alternate.display}
              </a>
            </li>
          </ul>
        </section>

        <section aria-labelledby="ig-title" className={card}>
          <h2 id="ig-title" className={cardTitle}>
            Instagram
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
            See what's new and send us a message.
          </p>
          <a
            href={CONTACT.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-[15px] font-medium hover:text-primary"
          >
            <Instagram className="h-4 w-4 text-primary" aria-hidden="true" />
            {CONTACT.instagram.handle}
            <span className="sr-only">(opens Instagram)</span>
          </a>
        </section>

        {email && (
          <section aria-labelledby="email-title" className={`${card} sm:col-span-2`}>
            <h2 id="email-title" className={cardTitle}>
              Email
            </h2>
            <a
              href={`mailto:${email}`}
              className="mt-4 inline-flex items-center gap-2 text-[15px] font-medium hover:text-primary"
            >
              <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
              {email}
            </a>
          </section>
        )}
      </div>

      <section aria-labelledby="stores-title" className="mt-16">
        <h2 id="stores-title" className="display text-4xl">
          Our stores
        </h2>
        <p className="mt-3 flex items-start gap-2 text-[15px] leading-relaxed text-muted-foreground">
          <Clock className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          Please call ahead to confirm opening hours.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {STORES.map((s) => (
            <article key={s.city} className={card}>
              <h3 className="display text-3xl">{s.city}</h3>
              <p className="mt-3 flex gap-2 text-[15px] leading-relaxed text-muted-foreground">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                {s.address}
              </p>
              <a
                href={`tel:${s.phone.tel}`}
                className="mt-3 inline-flex items-center gap-2 text-[15px] font-medium hover:text-primary"
              >
                <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
                {s.phone.display}
              </a>
              <div className="mt-5">
                <a
                  href={mapsUrl(s.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline rounded-lg"
                >
                  Get directions <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">to our {s.city} store (opens Google Maps)</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="bulk-title" className="mt-16 rounded-lg bg-secondary p-6 sm:p-8">
        <h2 id="bulk-title" className="display text-3xl">
          Buying in bulk?
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
          Resellers and boutiques can send a wholesale enquiry with the categories and approximate
          quantities they need.
        </p>
        <Link to="/wholesale" className="btn-primary mt-5 rounded-lg">
          Wholesale enquiry <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
    </ContentPage>
  );
}
