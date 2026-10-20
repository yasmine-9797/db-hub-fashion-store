import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Phone, Search, X } from "lucide-react";
import { CATEGORIES, PHONES, PRODUCTS, discountPct, whatsappUrl, type CategoryId, type Product } from "@/lib/store-data";

const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function Shop({ category, setCategory, query, setQuery, searchRef }: {
  category: CategoryId | "all"; setCategory: (c: CategoryId | "all") => void;
  query: string; setQuery: (q: string) => void; searchRef: React.RefObject<HTMLInputElement | null>;
}) {
  const [active, setActive] = useState<Product | null>(null);
  const list = useMemo(() => PRODUCTS.filter((p) =>
    (category === "all" || p.category === category) &&
    p.name.toLowerCase().includes(query.trim().toLowerCase())), [category, query]);

  return (
    <section id="new-arrivals" aria-labelledby="na-title" className="mx-auto max-w-7xl px-5 py-24 lg:px-10">
      <div id="shop" className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="eyebrow text-primary">Just landed</p>
          <h2 id="na-title" className="display mt-3 text-5xl md:text-7xl">New Arrivals</h2>
        </div>
        <label className="relative w-full md:w-80">
          <span className="sr-only">Search products</span>
          <Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search styles…" className="field pl-7" />
        </label>
      </div>

      <div role="group" aria-label="Filter by category" className="mt-8 flex flex-wrap gap-2">
        {[{ id: "all" as const, name: "All" }, ...CATEGORIES].map((c) => (
          <button key={c.id} onClick={() => setCategory(c.id)} aria-pressed={category === c.id}
            className={`eyebrow border px-4 py-2 text-[0.65rem] transition-colors ${category === c.id ? "border-primary bg-primary text-primary-foreground" : "hover:border-foreground"}`}>
            {c.name}
          </button>
        ))}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">Demo catalogue: product names and prices are placeholders, not confirmed stock or pricing. Please enquire for current availability.</p>

      {list.length === 0 ? (
        <div className="mt-12 border border-dashed py-20 text-center">
          <p className="display text-3xl">Nothing found</p>
          <p className="mt-2 text-sm text-muted-foreground">Try a different search or category.</p>
          <button onClick={() => { setQuery(""); setCategory("all"); }} className="btn-outline mt-6">Clear filters</button>
        </div>
      ) : (
        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
          {list.map((p) => {
            const off = discountPct(p);
            return (
            <li key={p.id} className="group card-3d" style={{ animationDelay: `${(list.indexOf(p) % 8) * 70}ms` }} onMouseMove={tilt} onMouseLeave={untilt}>
              <button onClick={() => setActive(p)} className="block w-full text-left" aria-label={`Quick view ${p.name}`}>
                <div className="card-3d-inner relative aspect-[3/4] overflow-hidden bg-muted shadow-lg">
                  <span className="card-3d-shine pointer-events-none absolute inset-0 z-10" />
                  <img src={p.img} alt={p.name} loading="lazy" width={768} height={1024} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  {off > 0 && <span className="eyebrow absolute left-0 top-0 bg-primary px-2.5 py-1.5 text-[0.6rem] text-primary-foreground">{off}% off</span>}
                  <span className="eyebrow absolute bottom-0 left-0 right-0 translate-y-full bg-foreground/85 py-3 text-center text-[0.6rem] text-background transition-transform group-hover:translate-y-0 group-focus-visible:translate-y-0">Quick view</span>
                </div>
                <p className="eyebrow mt-4 text-[0.6rem] text-muted-foreground">{CATEGORIES.find((c) => c.id === p.category)?.name}</p>
                <h3 className="mt-1 font-medium">{p.name}</h3>
                <p className="mt-1 text-sm">
                  {fmt(p.price)}
                  {off > 0 && <s className="ml-2 text-xs text-muted-foreground">{fmt(p.mrp)}</s>}
                  <span className="ml-2 text-xs text-muted-foreground">· demo price</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Sizes: {p.sizes.join(", ")}</p>
              </button>
            </li>
            );
          })}
        </ul>
      )}
      {active && <QuickView p={active} onClose={() => setActive(null)} />}
    </section>
  );
}

function tilt(e: React.MouseEvent<HTMLLIElement>) {
  const el = e.currentTarget, r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
  el.style.setProperty("--rx", `${-y * 14}deg`);
  el.style.setProperty("--ry", `${x * 14}deg`);
  el.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
  el.style.setProperty("--my", `${(y + 0.5) * 100}%`);
}
function untilt(e: React.MouseEvent<HTMLLIElement>) {
  e.currentTarget.style.setProperty("--rx", "0deg");
  e.currentTarget.style.setProperty("--ry", "0deg");
}

function QuickView({ p, onClose }: { p: Product; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [size, setSize] = useState<string | null>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [onClose]);
  const off = discountPct(p);
  const wa = whatsappUrl(`Hi DB Hub, I'd like to enquire about: ${p.name}${size ? ` (Size: ${size})` : ""}`);
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="qv-title" className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/60 sm:items-center sm:p-6" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="reveal grid max-h-[92vh] w-full max-w-4xl overflow-auto bg-background sm:grid-cols-2">
        <img src={p.img} alt={p.name} className="aspect-[3/4] w-full object-cover" />
        <div className="relative flex flex-col p-8">
          <button ref={closeRef} onClick={onClose} aria-label="Close" className="absolute right-4 top-4 p-2"><X className="h-5 w-5" /></button>
          <p className="eyebrow text-primary">{CATEGORIES.find((c) => c.id === p.category)?.name}</p>
          <h3 id="qv-title" className="display mt-3 text-4xl">{p.name}</h3>
          <p className="mt-4 text-xl">
            {fmt(p.price)}
            {off > 0 && <>
              <s className="ml-2 text-sm text-muted-foreground">{fmt(p.mrp)}</s>
              <span className="ml-2 text-xs text-primary">{off}% off</span>
            </>}
          </p>
          <p className="text-xs text-muted-foreground">Demo price — confirm in store.</p>
          <div className="mt-6">
            <p className="eyebrow text-[0.6rem] text-muted-foreground">Size</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {p.sizes.map((s) => (
                <button key={s} onClick={() => setSize(s)} aria-pressed={size === s}
                  className={`border px-3 py-1.5 text-xs transition-colors ${size === s ? "border-primary bg-primary text-primary-foreground" : "hover:border-foreground"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
          <div className="mt-auto flex flex-col gap-3 pt-8">
            {wa && <a href={wa} target="_blank" rel="noreferrer" className="btn-primary justify-center"><MessageCircle className="h-4 w-4" />Enquire on WhatsApp</a>}
            <a href="#contact" onClick={onClose} className={`${wa ? "btn-outline" : "btn-primary"} justify-center`}>Send an enquiry</a>
            <a href={`tel:${PHONES[0]}`} className="btn-outline justify-center"><Phone className="h-4 w-4" />Call {PHONES[0]}</a>
          </div>
        </div>
      </div>
    </div>
  );
}
