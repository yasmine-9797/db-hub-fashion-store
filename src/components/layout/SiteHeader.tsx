import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { CountBadge } from "@/components/common/CountBadge";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Logo } from "@/components/layout/Logo";
import { SearchDialog } from "@/components/layout/SearchDialog";
import { CONTACT } from "@/config/site";
import { HELP_LINKS, MAIN_NAV, type NavItem } from "@/config/navigation";
import { useBag } from "@/hooks/use-bag";
import { useSaved } from "@/hooks/use-saved";

const navLinkClass =
  "eyebrow text-[0.66rem] tracking-[0.18em] transition-colors hover:text-primary";
const activeProps = { className: "text-primary underline decoration-1 underline-offset-[10px]" };

function NavLink({
  item,
  className,
  onClick,
}: {
  item: NavItem;
  className: string;
  onClick?: () => void;
}) {
  return "to" in item ? (
    <Link to={item.to} onClick={onClick} className={className} activeProps={activeProps}>
      {item.label}
    </Link>
  ) : (
    <Link
      to="/collections/$slug"
      params={{ slug: item.collection }}
      onClick={onClick}
      className={className}
      activeProps={activeProps}
    >
      {item.label}
    </Link>
  );
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { count, setOpen: openBag } = useBag();
  const { ids: saved } = useSaved();

  return (
    <>
      <AnnouncementBar />
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-3 sm:h-20 sm:px-5 lg:px-10">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="grid h-10 w-10 place-items-center xl:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Logo />
          <nav aria-label="Main" className="mx-auto hidden xl:block">
            <ul className="flex items-center gap-7">
              {MAIN_NAV.map((item) => (
                <li key={item.label}>
                  <NavLink item={item} className={navLinkClass} />
                </li>
              ))}
            </ul>
          </nav>
          <div className="ml-auto flex items-center xl:ml-0">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search products"
              className="grid h-10 w-10 place-items-center hover:text-primary"
            >
              <Search className="h-5 w-5" />
            </button>
            <Link
              to="/wishlist"
              aria-label={saved.length ? `Wishlist, ${saved.length} saved` : "Wishlist"}
              className="relative hidden h-10 w-10 place-items-center hover:text-primary sm:grid"
            >
              <Heart className="h-5 w-5" />
              <CountBadge count={saved.length} />
            </Link>
            <button
              onClick={() => openBag(true)}
              aria-label={count ? `Open bag, ${count} item${count === 1 ? "" : "s"}` : "Open bag"}
              className="relative grid h-10 w-10 place-items-center hover:text-primary"
            >
              <ShoppingBag className="h-5 w-5" />
              <CountBadge count={count} />
            </button>
          </div>
        </div>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="left"
          hideClose
          overlayClassName="bg-ink/40 backdrop-blur-[2px]"
          className="flex w-[88vw] flex-col gap-0 p-0 sm:max-w-sm"
        >
          <div className="flex items-center justify-between border-b px-5 py-3">
            <Logo className="h-11" />
            <SheetClose
              aria-label="Close menu"
              className="grid h-10 w-10 place-items-center rounded-full hover:bg-secondary"
            >
              <X className="h-5 w-5" />
            </SheetClose>
          </div>
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Shop categories, help pages and contact options.
          </SheetDescription>
          <nav aria-label="Mobile" className="thin-scroll flex-1 overflow-y-auto px-5 py-4">
            <ul>
              {MAIN_NAV.map((item) => (
                <li key={item.label}>
                  <NavLink
                    item={item}
                    onClick={() => setMenuOpen(false)}
                    className="display block border-b border-border/60 py-3.5 text-[1.7rem]"
                  />
                </li>
              ))}
              <li>
                <Link
                  to="/wishlist"
                  onClick={() => setMenuOpen(false)}
                  className="display flex items-center justify-between border-b border-border/60 py-3.5 text-[1.7rem]"
                >
                  Wishlist{" "}
                  {saved.length > 0 && (
                    <span className="font-sans text-sm text-muted-foreground">
                      {saved.length} saved
                    </span>
                  )}
                </Link>
              </li>
            </ul>
            <ul className="mt-6 space-y-3 text-sm">
              {HELP_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} onClick={() => setMenuOpen(false)} className="hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="border-t px-5 py-4">
            <WhatsAppButton
              message="Hello DB Hub! I have a question."
              className="w-full rounded-lg"
            >
              Chat on WhatsApp
            </WhatsAppButton>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Call{" "}
              <a href={`tel:${CONTACT.primary.tel}`} className="underline">
                {CONTACT.primary.display}
              </a>{" "}
              or{" "}
              <a href={`tel:${CONTACT.alternate.tel}`} className="underline">
                {CONTACT.alternate.display}
              </a>
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
