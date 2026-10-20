import { useState } from "react";
import { Menu, Phone, Search, X } from "lucide-react";
import { PHONES } from "@/lib/store-data";

const NAV = [
  ["Home", "#home"], ["Shop", "#shop"], ["New Arrivals", "#new-arrivals"],
  ["Collections", "#collections"], ["Wholesale", "#wholesale"], ["Our Stores", "#stores"],
] as const;

export function Logo() {
  return (
    <a href="#home" className="flex flex-col leading-none" aria-label="DB Hub Cloth Store home">
      <span className="display text-3xl text-primary">DB Hub</span>
      <span className="eyebrow mt-1 text-[0.55rem] text-muted-foreground">Cloth Store</span>
    </a>
  );
}

export function Header({ onSearch }: { onSearch: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="bg-primary-deep py-2 text-center text-primary-foreground">
        <p className="eyebrow text-[0.6rem] sm:text-[0.68rem]">Trending Fashion • Wholesale &amp; Retail • Chennai × Coimbatore</p>
      </div>
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-10">
          <Logo />
          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex gap-8">
              {NAV.map(([l, h]) => (
                <li key={h}><a href={h} className="eyebrow text-[0.68rem] transition-colors hover:text-primary">{l}</a></li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-1">
            <button onClick={onSearch} aria-label="Search products" className="p-2.5 hover:text-primary"><Search className="h-5 w-5" /></button>
            <a href={`tel:${PHONES[0]}`} aria-label="Call us" className="p-2.5 hover:text-primary"><Phone className="h-5 w-5" /></a>
            <a href="#contact" className="btn-primary ml-2 hidden !px-4 !py-2.5 md:inline-flex">Contact</a>
            <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle menu" className="p-2.5 lg:hidden">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {open && (
          <nav aria-label="Mobile" className="border-t bg-background lg:hidden">
            <ul className="mx-auto max-w-7xl px-5 py-4">
              {[...NAV, ["Contact", "#contact"] as const].map(([l, h]) => (
                <li key={h}><a onClick={() => setOpen(false)} href={h} className="display block py-3 text-3xl">{l}</a></li>
              ))}
            </ul>
          </nav>
        )}
      </header>
    </>
  );
}
