import { Link } from "@tanstack/react-router";
import { Instagram, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/common/WhatsAppButton";
import { Logo } from "@/components/layout/Logo";
import { CONTACT, SITE, STORES } from "@/config/site";
import { HELP_LINKS, POLICY_LINKS } from "@/config/navigation";
import { CATEGORIES } from "@/lib/catalog";
import { waLink } from "@/lib/whatsapp";

const heading = "eyebrow text-[0.65rem] text-champagne";
const link = "text-sm text-background/75 transition-colors hover:text-background";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-10">
        <div>
          <Logo variant="badge" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-background/70">
            Women's, unisex, Korean-inspired, imported and surplus fashion — retail and wholesale
            from Chennai and Coimbatore.
          </p>
          <a
            href={CONTACT.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm hover:text-champagne"
          >
            <Instagram className="h-4 w-4" />
            {CONTACT.instagram.handle}
          </a>
        </div>

        <nav aria-label="Shop">
          <h2 className={heading}>Shop</h2>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link to="/shop" className={link}>
                All clothing
              </Link>
            </li>
            <li>
              <Link to="/collections/$slug" params={{ slug: "new-arrivals" }} className={link}>
                New arrivals
              </Link>
            </li>
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link to="/collections/$slug" params={{ slug: c.id }} className={link}>
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/collections/$slug" params={{ slug: "budget-finds" }} className={link}>
                Budget finds
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Help">
          <h2 className={heading}>Help</h2>
          <ul className="mt-4 space-y-2.5">
            {HELP_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className={link}>
                  {l.label}
                </Link>
              </li>
            ))}
            {POLICY_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className={link}>
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/faq" hash="payments" className={link}>
                Payment information
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className={heading}>Contact</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <a
                href={`tel:${CONTACT.primary.tel}`}
                className={`${link} inline-flex items-center gap-2`}
              >
                <Phone className="h-3.5 w-3.5" />
                {CONTACT.primary.display}
              </a>
            </li>
            <li>
              <a
                href={`tel:${CONTACT.alternate.tel}`}
                className={`${link} inline-flex items-center gap-2`}
              >
                <Phone className="h-3.5 w-3.5" />
                {CONTACT.alternate.display}
              </a>
            </li>
            <li>
              <a
                href={waLink("Hello DB Hub! I have a question.")}
                target="_blank"
                rel="noopener noreferrer"
                className={`${link} inline-flex items-center gap-2`}
              >
                <WhatsAppIcon className="h-3.5 w-3.5" />
                WhatsApp us
              </a>
            </li>
          </ul>
          <h2 className={`${heading} mt-8`}>Stores</h2>
          <ul className="mt-4 space-y-1.5 text-sm text-background/75">
            {STORES.map((s) => (
              <li key={s.city}>{s.city}</li>
            ))}
          </ul>
          <Link
            to="/contact"
            className="mt-2 inline-block text-xs text-background/60 underline-offset-4 hover:text-background hover:underline"
          >
            Store addresses
          </Link>
        </div>
      </div>
      <div className="border-t border-background/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-background/55 sm:flex-row sm:justify-between lg:px-10">
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p>Prices in Indian Rupees (INR).</p>
        </div>
      </div>
    </footer>
  );
}
