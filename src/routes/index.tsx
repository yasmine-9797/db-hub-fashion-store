import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Instagram, MapPin, Phone } from "lucide-react";
import hero from "@/assets/hero.jpg";
import storyImg from "@/assets/cat-imported.jpg";
import { Header, Logo } from "@/components/store/Header";
import { useScrollAnimations } from "@/hooks/use-scroll-animations";
import { Shop } from "@/components/store/Shop";
import { EnquiryForm } from "@/components/store/EnquiryForm";
import { CATEGORIES, GALLERY, INSTAGRAM_URL, PHONES, STORES, mapsUrl, type CategoryId } from "@/lib/store-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DB Hub Cloth Store — Korean, Unisex & Imported Fashion | Chennai & Coimbatore" },
      { name: "description", content: "Trend-aware, budget-friendly Korean-inspired, unisex, women's and imported surplus clothing. Wholesale & retail in Chennai and Coimbatore." },
      { property: "og:title", content: "DB Hub Cloth Store — Fashion That Moves With You" },
      { property: "og:description", content: "Wholesale & retail fashion stores in Chennai and Coimbatore." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  useScrollAnimations();
  const goShop = (c: CategoryId | "all") => {
    setCategory(c);
    document.getElementById("new-arrivals")?.scrollIntoView();
  };

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-background focus:p-3">Skip to content</a>
      <Header onSearch={() => { document.getElementById("new-arrivals")?.scrollIntoView(); setTimeout(() => searchRef.current?.focus({ preventScroll: true }), 400); }} />
      <main id="main">
        {/* HERO */}
        <section id="home" className="relative overflow-hidden bg-secondary">
          <img src={hero} alt="Model in an oversized burgundy suit" width={1600} height={1104} fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-[75%_center]" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent md:via-background/40" />
          <div className="relative mx-auto flex min-h-[82vh] max-w-7xl flex-col justify-end px-5 pb-16 pt-32 lg:px-10 lg:pb-24">
            <p className="eyebrow reveal text-primary">Your style. Your rules.</p>
            <h1 className="display reveal mt-5 max-w-3xl text-6xl [animation-delay:.1s] sm:text-7xl lg:text-[8.5rem]">
              Fashion That <em className="text-primary">Moves</em> With You.
            </h1>
            <p className="reveal mt-6 max-w-md text-base leading-relaxed text-foreground/80 [animation-delay:.2s]">
              Korean-inspired, unisex, imported and surplus clothing — trend-aware, budget-friendly and open to every shopper. Retail and wholesale.
            </p>
            <div className="reveal mt-9 flex flex-wrap gap-3 [animation-delay:.3s]">
              <a href="#collections" className="btn-primary">Explore Collection <ArrowRight className="h-4 w-4" /></a>
              <a href="#stores" className="btn-outline">Visit Our Stores</a>
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section id="collections" aria-labelledby="col-title" className="mx-auto max-w-7xl px-5 py-24 lg:px-10">
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow text-primary">Collections</p>
              <h2 id="col-title" className="display mt-3 text-5xl md:text-7xl">Shop by mood</h2>
            </div>
            <button onClick={() => goShop("all")} className="eyebrow hidden items-center gap-2 text-[0.68rem] hover:text-primary md:flex">View all <ArrowRight className="h-4 w-4" /></button>
          </div>
          <ul className="mt-12 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
            {CATEGORIES.map((c, i) => (
              <li key={c.id} className={i % 2 ? "lg:mt-12" : ""}>
                <button onClick={() => goShop(c.id)} className="group relative block aspect-[3/4] w-full overflow-hidden text-left" aria-label={`Browse ${c.name}`}>
                  <img src={c.img} alt="" loading="lazy" width={768} height={1024} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-background md:p-6">
                    <span className="eyebrow text-[0.6rem] text-champagne">0{i + 1}</span>
                    <h3 className="display mt-2 text-2xl md:text-4xl">{c.name}</h3>
                    <p className="mt-1 hidden text-xs opacity-80 sm:block">{c.note}</p>
                    <ArrowUpRight className="absolute right-4 top-0 h-5 w-5 -translate-y-full opacity-0 transition-all group-hover:opacity-100 md:right-6" />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <Shop category={category} setCategory={setCategory} query={query} setQuery={setQuery} searchRef={searchRef} />

        {/* WHOLESALE / RETAIL */}
        <section id="wholesale" aria-labelledby="ws-title" className="grid md:grid-cols-2">
          <div className="bg-primary-deep px-6 py-20 text-primary-foreground md:px-14 lg:py-28">
            <p className="eyebrow text-champagne">For resellers & boutiques</p>
            <h2 id="ws-title" className="display mt-4 text-5xl lg:text-7xl">Wholesale</h2>
            <p className="mt-6 max-w-sm leading-relaxed opacity-80">Stock your store with trend-led Korean-inspired, unisex and imported surplus lots. Tell us what you need and we'll talk quantities and options.</p>
            <a href="#contact" className="btn-outline mt-10 !border-primary-foreground !text-primary-foreground hover:!bg-primary-foreground hover:!text-primary-deep">Wholesale enquiry <ArrowRight className="h-4 w-4" /></a>
          </div>
          <div className="bg-champagne/40 px-6 py-20 md:px-14 lg:py-28">
            <p className="eyebrow text-primary">For everyday style</p>
            <h2 className="display mt-4 text-5xl lg:text-7xl">Retail</h2>
            <p className="mt-6 max-w-sm leading-relaxed text-foreground/75">Walk in, try on, and find pieces that feel like you — at prices that let you keep exploring. Everyone's welcome.</p>
            <a href="#stores" className="btn-outline mt-10">Find a store <ArrowRight className="h-4 w-4" /></a>
          </div>
        </section>

        {/* STORY */}
        <section aria-labelledby="story-title" className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-28 md:grid-cols-12 lg:px-10">
          <img src={storyImg} alt="Folded imported knitwear and denim" loading="lazy" width={768} height={1024} className="aspect-[4/5] w-full object-cover md:col-span-5" />
          <div className="md:col-span-6 md:col-start-7">
            <p className="eyebrow text-primary">Our story</p>
            <h2 id="story-title" className="display mt-4 text-5xl lg:text-6xl">Style shouldn't come with a gatekeeper.</h2>
            <p className="mt-6 leading-relaxed text-muted-foreground">DB Hub began with a simple idea: bring the looks people love — Korean-inspired silhouettes, easy unisex fits and quality imported pieces — to shoppers at honest, budget-friendly prices.</p>
            <p className="mt-4 leading-relaxed text-muted-foreground">From our stores in Chennai and Coimbatore, we serve individual shoppers and resellers alike, keeping the racks fresh and the welcome warm.</p>
          </div>
        </section>

        {/* STORES */}
        <section id="stores" aria-labelledby="stores-title" className="border-t bg-card">
          <div className="mx-auto max-w-7xl px-5 py-24 lg:px-10">
            <p className="eyebrow text-primary">Visit us</p>
            <h2 id="stores-title" className="display mt-3 text-5xl md:text-7xl">Our Stores</h2>
            <div className="mt-12 grid gap-px bg-border md:grid-cols-2">
              {STORES.map((s) => (
                <article key={s.city} className="bg-card p-8 md:p-12">
                  <h3 className="display text-4xl md:text-5xl">{s.city}</h3>
                  <p className="mt-5 flex gap-3 text-sm leading-relaxed text-muted-foreground"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{s.address}</p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <a href={`tel:${s.phone}`} className="btn-primary"><Phone className="h-4 w-4" />{s.phone}</a>
                    <a href={mapsUrl(s.address)} target="_blank" rel="noreferrer" className="btn-outline">Directions <ArrowUpRight className="h-4 w-4" /></a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* INSTAGRAM */}
        <section aria-labelledby="ig-title" className="py-24">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-5 md:flex-row md:items-end lg:px-10">
            <div>
              <p className="eyebrow text-primary">@db_hub_cloth_store</p>
              <h2 id="ig-title" className="display mt-3 text-5xl md:text-7xl">Follow the drops</h2>
            </div>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="btn-outline self-start"><Instagram className="h-4 w-4" />Open Instagram</a>
          </div>
          <ul className="mt-12 grid grid-cols-3 gap-1 md:grid-cols-6">
            {GALLERY.map((g, i) => (
              <li key={i}>
                <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="View DB Hub on Instagram" className="group relative block aspect-square overflow-hidden">
                  <img src={g} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                  <span className="absolute inset-0 flex items-center justify-center bg-primary/0 transition group-hover:bg-primary/50"><Instagram className="h-6 w-6 text-primary-foreground opacity-0 group-hover:opacity-100" /></span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-center text-xs text-muted-foreground">Preview imagery — see our latest posts on Instagram.</p>
        </section>

        {/* CONTACT */}
        <section id="contact" aria-labelledby="contact-title" className="border-t">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:grid-cols-12 lg:px-10">
            <div className="md:col-span-4">
              <p className="eyebrow text-primary">Enquire</p>
              <h2 id="contact-title" className="display mt-3 text-5xl md:text-6xl">Let's talk style.</h2>
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">Retail question or wholesale order — share a few details, or call us directly.</p>
              <ul className="mt-8 space-y-3">
                {PHONES.map((p) => <li key={p}><a href={`tel:${p}`} className="display text-3xl hover:text-primary">{p}</a></li>)}
              </ul>
            </div>
            <div className="md:col-span-7 md:col-start-6"><EnquiryForm /></div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-ink text-background">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
          <div>
            <div className="[&_span:first-child]:text-champagne [&_span:last-child]:text-background/60"><Logo /></div>
            <p className="mt-4 max-w-xs text-sm text-background/60">Wholesale & retail fashion. Korean-inspired, unisex, imported & surplus.</p>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm hover:text-champagne"><Instagram className="h-4 w-4" />Instagram</a>
          </div>
          <div>
            <h3 className="eyebrow text-champagne">Shop</h3>
            <ul className="mt-4 space-y-2 text-sm text-background/70">
              {CATEGORIES.map((c) => <li key={c.id}><button onClick={() => goShop(c.id)} className="hover:text-background">{c.name}</button></li>)}
            </ul>
          </div>
          <div>
            <h3 className="eyebrow text-champagne">Contact</h3>
            <ul className="mt-4 space-y-2 text-sm text-background/70">
              {PHONES.map((p) => <li key={p}><a href={`tel:${p}`} className="hover:text-background">{p}</a></li>)}
              <li><a href="#contact" className="hover:text-background">Wholesale enquiry</a></li>
            </ul>
          </div>
          <div>
            <h3 className="eyebrow text-champagne">Stores</h3>
            <ul className="mt-4 space-y-4 text-sm text-background/70">
              {STORES.map((s) => <li key={s.city}><a href={mapsUrl(s.address)} target="_blank" rel="noreferrer" className="hover:text-background"><strong className="text-background">{s.city}</strong><br />{s.address}</a></li>)}
            </ul>
          </div>
        </div>
        <p className="border-t border-background/10 py-6 text-center text-xs text-background/50">© {new Date().getFullYear()} DB Hub Cloth Store</p>
      </footer>
    </>
  );
}
