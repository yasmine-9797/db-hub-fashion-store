import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Instagram,
  Layers,
  MessageCircle,
  Search,
  Shirt,
  Store,
} from "lucide-react";
import hero from "@/assets/hero.jpg";
import lookKorean from "@/assets/cat-korean.jpg";
import lookStreet from "@/assets/p-tee.jpg";
import lookLayer from "@/assets/p-bomber.jpg";
import lookEssentials from "@/assets/p-shirt.jpg";
import lookNew from "@/assets/p-blouse.jpg";
import { Reveal } from "@/components/common/Reveal";
import { WhatsAppButton, WhatsAppIcon } from "@/components/common/WhatsAppButton";
import { Container, PageShell } from "@/components/layout/PageShell";
import { ProductCard, ProductGrid } from "@/components/product/ProductCard";
import { CONTACT, SITE, STORES } from "@/config/site";
import {
  ACTIVE_PRODUCTS,
  CATALOGUE_IS_DEMO,
  COLLECTIONS,
  HOME_CATEGORY_SLUGS,
  matchesCollection,
  sortProducts,
  type Collection,
} from "@/lib/catalog";
import { seo } from "@/lib/seo";
import { wholesaleMessage } from "@/lib/whatsapp";
import gallery1 from "@/assets/cat-women.jpg";
import gallery2 from "@/assets/p-satin.jpg";
import gallery3 from "@/assets/cat-unisex.jpg";
import gallery4 from "@/assets/p-knit.jpg";
import gallery5 from "@/assets/p-denim.jpg";
import gallery6 from "@/assets/cat-imported.jpg";

export const Route = createFileRoute("/")({
  head: () =>
    seo({ title: `${SITE.name} | ${SITE.tagline}`, description: SITE.description, path: "/" }),
  component: Home,
});

const featured = sortProducts(
  ACTIVE_PRODUCTS.filter((p) => p.featured),
  "featured",
).slice(0, 8);
const budget = sortProducts(
  ACTIVE_PRODUCTS.filter((p) => p.budgetEdit),
  "price-asc",
);
const categories = HOME_CATEGORY_SLUGS.map((slug) =>
  COLLECTIONS.find((c) => c.slug === slug),
).filter((c): c is Collection => Boolean(c));
const countIn = (c: Collection) => ACTIVE_PRODUCTS.filter((p) => matchesCollection(p, c)).length;

const LOOKBOOK = [
  {
    title: "Korean-Inspired Looks",
    note: "Soft knits, pleats and layered pastels",
    img: lookKorean,
    slug: "korean",
    span: "md:col-span-7 md:row-span-2",
  },
  {
    title: "Everyday Essentials",
    note: "Easy shirts you'll reach for daily",
    img: lookEssentials,
    slug: "unisex",
    span: "md:col-span-5",
  },
  {
    title: "Layering & Outerwear",
    note: "Jackets and bombers for every season",
    img: lookLayer,
    slug: "shirts-outerwear",
    span: "md:col-span-5",
  },
  {
    title: "Casual Street Style",
    note: "Graphic tees, baggy denim, oversized fits",
    img: lookStreet,
    slug: "tops-tees",
    span: "md:col-span-6",
  },
  {
    title: "New Season Finds",
    note: "The latest pieces to land at DB Hub",
    img: lookNew,
    slug: "new-arrivals",
    span: "md:col-span-6",
  },
];

const BENEFITS = [
  {
    icon: Store,
    title: "Wholesale & retail",
    text: "Shop a single piece or enquire about bulk buying for your boutique.",
  },
  {
    icon: Layers,
    title: "Many ways to dress",
    text: "Women's wear, unisex fashion, Korean-inspired styles and imported finds.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp assistance",
    text: "Ask about sizes, availability or an order and chat directly with our team.",
  },
  {
    icon: Search,
    title: "Easy enquiries",
    text: "Send your whole bag as one enquiry — we confirm stock and price with you.",
  },
  {
    icon: Shirt,
    title: "Browse online, visit in store",
    text: `Explore online, then shop or collect in ${STORES.map((s) => s.city).join(" or ")}.`,
  },
];

const GALLERY = [gallery1, gallery2, gallery3, gallery4, gallery5, gallery6];

function Home() {
  return (
    <PageShell>
      {/* C — HERO */}
      {/*
        Phones: the photo fills the first screen with the model centred; the copy sits at the
        bottom in ivory on a dark fade that starts just above the text, so it stays readable over
        the photo and the buttons stay on screen. Tablets: the photo fills the hero with the model
        on the right and the copy on the empty backdrop to her left. Desktop: text column + image
        column. `short:` trims the copy on short screens (phones with browser bars showing,
        landscape phones, small laptops). In the photo the model stands at ~58–80% across.
      */}
      <section aria-labelledby="hero-title" className="relative overflow-hidden bg-background">
        <div className="relative mx-auto grid max-w-7xl lg:min-h-[min(calc(100dvh-7rem),56rem)] lg:grid-cols-[1fr_1.05fr]">
          <div className="absolute inset-0 lg:relative lg:order-2">
            <img
              src={hero}
              alt="Model in an oversized burgundy blazer and wide-leg trousers"
              width={1600}
              height={1104}
              fetchPriority="high"
              className="hero-zoom h-full w-full object-cover object-[80%_top] sm:object-[35%_15%] lg:absolute lg:inset-0 lg:object-[78%_center]"
            />
            {/* Tablets: ivory fade from the left behind the copy. */}
            <div className="pointer-events-none absolute inset-0 hidden bg-linear-to-r from-background/95 via-background/70 via-38% to-transparent to-62% sm:block lg:hidden" />
          </div>

          <div className="relative flex min-h-[min(calc(100svh-6rem),52rem)] flex-col justify-end sm:min-h-[min(78svh,48rem)] sm:max-w-[28rem] sm:justify-center sm:px-8 sm:py-16 md:max-w-[30rem] lg:order-1 lg:min-h-0 lg:max-w-none lg:px-10 lg:py-20 sm:short:py-10">
            <div className="bg-linear-to-t from-ink/90 via-ink/75 via-70% to-transparent px-5 pb-8 pt-24 text-background sm:bg-none sm:p-0 sm:text-foreground">
              <p className="eyebrow reveal sm:text-primary">Meet your new favourite finds</p>
              <h1
                id="hero-title"
                className="display reveal mt-3 text-[clamp(2.4rem,11.5vw,3.1rem)] leading-[0.95] [animation-delay:.08s] sm:mt-5 sm:text-6xl lg:text-[clamp(3.5rem,10svh,4.5rem)] xl:text-[clamp(4.5rem,11.5svh,5.6rem)] sm:max-lg:short:text-[2.75rem]"
              >
                Everyday style.
                <br />
                <em className="font-medium text-champagne sm:text-primary">
                  Unbelievably good finds.
                </em>
              </h1>
              {/* Short line on phones keeps the buttons on the first screen; full copy from tablet up. */}
              <p className="reveal mt-3 text-[0.95rem] text-background/85 [animation-delay:.16s] sm:hidden short:hidden">
                Women's, unisex, Korean &amp; imported fashion.
              </p>
              <p className="reveal mt-6 hidden max-w-md text-[1.02rem] leading-relaxed text-muted-foreground [animation-delay:.16s] sm:block lg:mt-7 sm:max-lg:short:hidden">
                Discover your next favourite look with fashion finds from DB Hub. Explore women's
                styles, unisex essentials, Korean fashion, imported collections and more.
              </p>
              <div className="reveal mt-6 flex flex-col gap-3 [animation-delay:.24s] sm:mt-8 sm:flex-row lg:mt-9">
                <Link
                  to="/shop"
                  className="btn-primary justify-center rounded-lg max-sm:bg-background max-sm:text-primary-deep max-sm:hover:bg-white"
                >
                  Shop the collection <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/wholesale"
                  className="btn-outline justify-center rounded-lg max-sm:border-background/70 max-sm:text-background max-sm:hover:bg-background max-sm:hover:text-ink sm:max-lg:bg-background/60 sm:max-lg:backdrop-blur-sm"
                >
                  Explore wholesale
                </Link>
              </div>
              <p className="reveal mt-8 hidden items-center gap-3 text-sm text-muted-foreground [animation-delay:.32s] sm:flex lg:mt-10 sm:short:hidden">
                <span className="h-px w-10 bg-champagne" />
                Retail & wholesale · {STORES.map((s) => s.city).join(" · ")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* D — CATEGORIES */}
      <section aria-labelledby="cat-title" className="py-20 lg:py-28">
        <Container>
          <Reveal className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow text-primary">Shop by category</p>
              <h2 id="cat-title" className="display mt-3 text-5xl md:text-6xl">
                Find your fit
              </h2>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary"
            >
              View everything <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
          <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-5">
            {categories.map((c, i) => (
              <Reveal as="li" key={c.slug} delay={(i % 4) * 70}>
                <Link
                  to="/collections/$slug"
                  params={{ slug: c.slug }}
                  className="group relative block aspect-[3/4] overflow-hidden bg-muted"
                >
                  <img
                    src={c.image}
                    alt=""
                    loading="lazy"
                    width={768}
                    height={1024}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/5 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 text-white md:p-5">
                    <div>
                      <h3 className="display text-2xl leading-tight md:text-3xl">{c.title}</h3>
                      <p className="mt-1 text-xs text-white/75">
                        {countIn(c)} {countIn(c) === 1 ? "piece" : "pieces"}
                      </p>
                    </div>
                    <ArrowUpRight className="h-5 w-5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      {/* E — FEATURED */}
      <section aria-labelledby="featured-title" className="border-t bg-card py-20 lg:py-28">
        <Container>
          <Reveal className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow text-primary">Featured</p>
              <h2 id="featured-title" className="display mt-3 text-5xl md:text-6xl">
                Pieces we love right now
              </h2>
              {CATALOGUE_IS_DEMO && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Illustrative demo products — please confirm availability with our team.
                </p>
              )}
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary"
            >
              Shop all <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
          <ProductGrid products={featured} className="mt-10 lg:grid-cols-4" />
        </Container>
      </section>

      {/* F — BUDGET EDIT */}
      <section
        aria-labelledby="budget-title"
        className="overflow-hidden bg-primary-deep py-20 text-primary-foreground lg:py-28"
      >
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <Reveal>
            <p className="eyebrow text-champagne">The smart edit</p>
            <h2 id="budget-title" className="display mt-4 text-5xl leading-[0.95] md:text-7xl">
              Good style.
              <br />
              <em className="text-champagne">Smart finds.</em>
            </h2>
            <p className="mt-6 max-w-sm text-[1.02rem] leading-relaxed text-primary-foreground/80">
              Discover pieces that make personal style more accessible — an edit chosen by our team.
            </p>
            <Link
              to="/collections/$slug"
              params={{ slug: "budget-finds" }}
              className="btn-outline mt-9 rounded-lg !border-primary-foreground !text-primary-foreground hover:!bg-primary-foreground hover:!text-primary-deep"
            >
              Explore the edit <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
          <ul className="-mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] lg:mx-0 lg:px-0">
            {budget.map((p) => (
              <li
                key={p.id}
                className="w-[62vw] max-w-[260px] shrink-0 snap-start rounded-sm bg-background p-3 text-foreground sm:w-[240px]"
              >
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* G — LOOKBOOK */}
      <section aria-labelledby="look-title" className="py-20 lg:py-28">
        <Container>
          <Reveal className="max-w-2xl">
            <p className="eyebrow text-primary">The lookbook</p>
            <h2 id="look-title" className="display mt-3 text-5xl md:text-7xl">
              Ways to wear it
            </h2>
            <p className="mt-4 text-[1.02rem] leading-relaxed text-muted-foreground">
              Styling ideas across our collections. Imagery is illustrative while our own shoots are
              prepared.
            </p>
          </Reveal>
          <ul className="mt-12 grid auto-rows-[18rem] gap-4 md:grid-cols-12 md:auto-rows-[20rem] lg:gap-5">
            {LOOKBOOK.map((l, i) => (
              <Reveal as="li" key={l.title} delay={(i % 3) * 90} className={l.span}>
                <Link
                  to="/collections/$slug"
                  params={{ slug: l.slug }}
                  className="group relative block h-full overflow-hidden bg-muted"
                >
                  <img
                    src={l.img}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white md:p-7">
                    <span className="eyebrow text-[0.6rem] text-champagne">0{i + 1}</span>
                    <h3 className="display mt-2 text-3xl md:text-4xl">{l.title}</h3>
                    <p className="mt-1 text-sm text-white/80">{l.note}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      {/* H — WHY DB HUB */}
      <section aria-labelledby="why-title" className="border-y bg-secondary/50 py-20 lg:py-24">
        <Container>
          <Reveal className="text-center">
            <p className="eyebrow text-primary">Why shop with us</p>
            <h2 id="why-title" className="display mt-3 text-5xl md:text-6xl">
              Why shop with DB Hub?
            </h2>
          </Reveal>
          <ul className="mt-12 grid gap-px overflow-hidden border bg-border sm:grid-cols-2 lg:grid-cols-5">
            {BENEFITS.map((b) => (
              <li key={b.title} className="bg-background p-6 lg:p-7">
                <b.icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                <h3 className="mt-4 font-semibold">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* I — INSTAGRAM */}
      <section aria-labelledby="ig-title" className="py-20 lg:py-28">
        <Container className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <Reveal>
            <p className="eyebrow text-primary">{CONTACT.instagram.handle}</p>
            <h2 id="ig-title" className="display mt-3 text-5xl md:text-7xl">
              Find us on Instagram
            </h2>
          </Reveal>
          <a
            href={CONTACT.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary rounded-lg"
          >
            <Instagram className="h-4 w-4" />
            Follow DB Hub
          </a>
        </Container>
        <ul className="mt-12 grid grid-cols-3 gap-1 md:grid-cols-6">
          {GALLERY.map((src, i) => (
            <li key={src}>
              <a
                href={CONTACT.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View DB Hub on Instagram (image ${i + 1})`}
                className="group relative block aspect-square overflow-hidden bg-muted"
              >
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />
                <span className="absolute inset-0 grid place-items-center bg-primary/0 transition group-hover:bg-primary/45">
                  <Instagram className="h-6 w-6 text-white opacity-0 transition group-hover:opacity-100" />
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Preview images — see our latest posts on Instagram.
        </p>
      </section>

      {/* J — WHOLESALE CTA */}
      <section aria-labelledby="ws-title" className="bg-ink py-20 text-background lg:py-24">
        <Container className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <Reveal>
            <p className="eyebrow text-champagne">Wholesale</p>
            <h2 id="ws-title" className="display mt-4 text-5xl md:text-7xl">
              Looking to buy in bulk?
            </h2>
            <p className="mt-5 max-w-lg text-[1.02rem] leading-relaxed text-background/75">
              Connect with DB Hub to enquire about wholesale collections and bulk purchasing for
              your store or boutique.
            </p>
          </Reveal>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-start">
            <WhatsAppButton message={wholesaleMessage({})} className="rounded-lg">
              Enquire on WhatsApp
            </WhatsAppButton>
            <Link
              to="/wholesale"
              className="btn-outline rounded-lg !border-background/40 !text-background hover:!bg-background hover:!text-ink"
            >
              Send a wholesale enquiry
            </Link>
            <p className="flex items-center gap-2 text-sm text-background/60">
              <WhatsAppIcon className="h-3.5 w-3.5" />
              {CONTACT.primary.display}
            </p>
          </div>
        </Container>
      </section>
    </PageShell>
  );
}
