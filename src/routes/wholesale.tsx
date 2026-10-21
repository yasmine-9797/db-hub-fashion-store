import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import heroImg from "@/assets/cat-imported.jpg";
import { Reveal } from "@/components/common/Reveal";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { WholesaleForm } from "@/components/forms/WholesaleForm";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container, PageShell } from "@/components/layout/PageShell";
import { CONTACT, STORES } from "@/config/site";
import { CATEGORIES } from "@/lib/catalog";
import { breadcrumbJsonLd, seo } from "@/lib/seo";
import { wholesaleMessage } from "@/lib/whatsapp";

export const Route = createFileRoute("/wholesale")({
  head: () =>
    seo({
      title: "Wholesale Enquiries",
      description:
        "Enquire about wholesale and bulk fashion from DB Hub Cloth Store — women's wear, unisex, Korean-inspired, imported and surplus collections. Chennai & Coimbatore.",
      path: "/wholesale",
      jsonLd: breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Wholesale", path: "/wholesale" },
      ]),
    }),
  component: WholesalePage,
});

const STEPS = [
  {
    title: "Tell us what you need",
    text: "Share the styles, categories and rough quantities you're looking for.",
  },
  {
    title: "We share what's available",
    text: "Our team replies with current collections and lots that match.",
  },
  { title: "Agree the details", text: "Confirm pieces, quantities and pricing directly with us." },
  {
    title: "Collect or receive",
    text: `Pick up from ${STORES.map((s) => s.city).join(" or ")}, or arrange delivery with our team.`,
  },
];

function WholesalePage() {
  return (
    <PageShell>
      <section className="relative overflow-hidden bg-ink text-background">
        <img
          src={heroImg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/30" />
        <Container className="relative py-16 lg:py-28">
          <div className="[&_*]:text-background/70 [&_[aria-current]]:text-background">
            <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Wholesale" }]} />
          </div>
          <p className="eyebrow mt-10 text-champagne">Wholesale & bulk</p>
          <h1 className="display mt-4 max-w-3xl text-5xl leading-[0.95] sm:text-7xl">
            Your next bulk fashion sourcing partner.
          </h1>
          <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-background/80">
            Explore wholesale enquiries for DB Hub's available fashion collections — for boutiques,
            resellers and bulk buyers.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="#enquiry" className="btn-primary justify-center rounded-lg">
              Send an enquiry
            </a>
            <WhatsAppButton
              variant="outline"
              message={wholesaleMessage({})}
              className="rounded-lg !border-background/50 !text-background hover:!bg-background hover:!text-ink"
            >
              Enquire on WhatsApp
            </WhatsAppButton>
          </div>
        </Container>
      </section>

      <section aria-labelledby="supply-title" className="py-20">
        <Container>
          <Reveal>
            <p className="eyebrow text-primary">What we supply</p>
            <h2 id="supply-title" className="display mt-3 text-5xl">
              Collections for your store
            </h2>
          </Reveal>
          <ul className="mt-10 grid gap-px overflow-hidden border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((c) => (
              <li key={c.id} className="bg-background">
                <Link
                  to="/collections/$slug"
                  params={{ slug: c.id }}
                  className="group flex h-full flex-col p-6 hover:bg-secondary/40"
                >
                  <h3 className="display text-3xl">{c.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {c.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    Browse <ArrowUpRight className="h-4 w-4" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            Availability, quantities and wholesale pricing are confirmed by our team for each
            enquiry.
          </p>
        </Container>
      </section>

      <section aria-labelledby="how-title" className="border-y bg-secondary/50 py-20">
        <Container>
          <h2 id="how-title" className="display text-5xl">
            How it works
          </h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="display text-5xl text-primary">0{i + 1}</span>
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section id="enquiry" aria-labelledby="enquiry-title" className="scroll-mt-28 py-20">
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow text-primary">Enquire</p>
            <h2 id="enquiry-title" className="display mt-3 text-5xl">
              Start your wholesale enquiry
            </h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              Share a few details and our team will get back to you. Prefer to talk? Call or
              WhatsApp us.
            </p>
            <ul className="mt-8 space-y-2 text-sm">
              <li>
                <a
                  href={`tel:${CONTACT.primary.tel}`}
                  className="display text-3xl hover:text-primary"
                >
                  {CONTACT.primary.display}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${CONTACT.alternate.tel}`}
                  className="display text-3xl hover:text-primary"
                >
                  {CONTACT.alternate.display}
                </a>
              </li>
            </ul>
          </div>
          <WholesaleForm />
        </Container>
      </section>
    </PageShell>
  );
}
