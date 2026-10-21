import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Instagram, MapPin } from "lucide-react";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { ContentPage } from "@/components/content/ContentPage";
import { CONTACT, STORES } from "@/config/site";
import { CATALOGUE_IS_DEMO, CATEGORIES } from "@/lib/catalog";
import { breadcrumbJsonLd, seo } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () =>
    seo({
      title: "About DB Hub",
      description:
        "DB Hub Cloth Store sells women's wear, unisex, Korean-inspired, imported and surplus fashion — retail and wholesale, from stores in Chennai and Coimbatore.",
      path: "/about",
      jsonLd: breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
      ]),
    }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <ContentPage
      eyebrow="About us"
      title="About DB Hub"
      intro="DB Hub Cloth Store is a fashion store with shops in Chennai and Coimbatore. We sell women's wear, unisex fashion, Korean-inspired styles and imported and surplus clothing — to everyday shoppers and, in bulk, to resellers."
      crumbs={[{ label: "Home", to: "/" }, { label: "About" }]}
    >
      <section aria-labelledby="sell-title">
        <h2 id="sell-title" className="display text-4xl">
          What we sell
        </h2>
        <ul className="mt-6 grid gap-6 sm:grid-cols-2">
          {CATEGORIES.map((c) => (
            <li key={c.id}>
              <Link to="/collections/$slug" params={{ slug: c.id }} className="group block">
                <span className="block overflow-hidden rounded-lg bg-secondary">
                  <img
                    src={c.image}
                    alt=""
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </span>
                <span className="display mt-4 block text-2xl group-hover:text-primary">
                  {c.name}
                </span>
                <span className="mt-1 block text-[15px] text-muted-foreground">
                  {c.description}
                </span>
                <span className="eyebrow mt-3 inline-flex items-center gap-2 text-[0.65rem] text-primary">
                  Shop {c.name} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {CATALOGUE_IS_DEMO && (
          <p className="mt-8 rounded-lg border border-dashed p-4 text-[15px] leading-relaxed text-muted-foreground">
            Our online catalogue is still being set up — some pieces shown are illustrative while we
            add our real stock. Please confirm availability with us on WhatsApp or by phone before
            ordering.
          </p>
        )}
      </section>

      <section aria-labelledby="trade-title" className="mt-16">
        <h2 id="trade-title" className="display text-4xl">
          Retail and wholesale
        </h2>
        <div className="mt-6 grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2">
          <div className="bg-card p-6">
            <p className="eyebrow text-primary">Retail</p>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              Shop online, order on WhatsApp or visit one of our stores. We deliver across India,
              and pickup from our Chennai and Coimbatore stores is free.
            </p>
            <Link
              to="/shop"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:text-primary hover:underline"
            >
              Browse the shop <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="bg-card p-6">
            <p className="eyebrow text-primary">Wholesale</p>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              Buying for a shop or boutique? Tell us the categories and rough quantities you need
              and our team will get in touch to discuss options.
            </p>
            <Link
              to="/wholesale"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:text-primary hover:underline"
            >
              Wholesale enquiries <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="visit-title" className="mt-16">
        <h2 id="visit-title" className="display text-4xl">
          Visit us
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
          Our stores are in two cities in Tamil Nadu.
        </p>
        <ul className="mt-5 flex flex-wrap gap-3">
          {STORES.map((s) => (
            <li
              key={s.city}
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium"
            >
              <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
              {s.city}
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 font-medium underline underline-offset-4 hover:text-primary"
          >
            Addresses, phone numbers and directions
          </Link>
          <a
            href={CONTACT.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 hover:text-primary"
          >
            <Instagram className="h-4 w-4" aria-hidden="true" />
            {CONTACT.instagram.handle}
            <span className="sr-only">(opens Instagram)</span>
          </a>
        </div>
      </section>

      <div className="mt-16 flex flex-col gap-3 border-t pt-10 sm:flex-row">
        <Link to="/shop" className="btn-primary justify-center rounded-lg">
          Shop the collection
        </Link>
        <WhatsAppButton
          variant="outline"
          message="Hello DB Hub! I'd like to know more about your clothing."
          className="rounded-lg"
        >
          Chat on WhatsApp
        </WhatsAppButton>
      </div>
    </ContentPage>
  );
}
