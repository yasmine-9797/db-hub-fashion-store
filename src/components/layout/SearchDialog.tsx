import { useDeferredValue, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowRight, Search, X } from "lucide-react";
import {
  ACTIVE_PRODUCTS,
  COLLECTIONS,
  categoryName,
  filterProducts,
  primaryImage,
  sortProducts,
} from "@/lib/catalog";
import { formatINR } from "@/lib/money";

const POPULAR = ["new-arrivals", "women", "korean", "budget-finds"];

/** Header search: live suggestions as you type, Enter opens the full results page. */
export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [q, setQ] = useState("");
  const deferred = useDeferredValue(q.trim());
  const navigate = useNavigate();
  const results = deferred
    ? sortProducts(filterProducts(ACTIVE_PRODUCTS, { q: deferred }), "featured").slice(0, 6)
    : [];
  const close = () => onOpenChange(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed inset-x-0 top-0 z-50 max-h-[100dvh] overflow-y-auto bg-background shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top">
          <div className="mx-auto max-w-3xl px-5 py-6 lg:py-10">
            <DialogPrimitive.Title className="sr-only">Search DB Hub</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              Search products by name, category or colour.
            </DialogPrimitive.Description>
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                if (!q.trim()) return;
                close();
                void navigate({ to: "/search", search: { q: q.trim() } });
              }}
              className="flex items-center gap-3 border-b-2 border-foreground pb-3"
            >
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <label htmlFor="site-search" className="sr-only">
                Search products
              </label>
              <input
                id="site-search"
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search dresses, shirts, Korean knits…"
                autoComplete="off"
                enterKeyHint="search"
                className="min-w-0 flex-1 bg-transparent font-display text-2xl outline-none placeholder:text-muted-foreground/60 sm:text-3xl"
              />
              <DialogPrimitive.Close
                aria-label="Close search"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </DialogPrimitive.Close>
            </form>

            {deferred ? (
              <div className="mt-6" aria-live="polite">
                {results.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No products match “{deferred}”. Try a category or colour, like “dress” or
                    “black”.
                  </p>
                ) : (
                  <>
                    <ul className="divide-y">
                      {results.map((p) => (
                        <li key={p.id}>
                          <Link
                            to="/products/$slug"
                            params={{ slug: p.slug }}
                            onClick={close}
                            className="flex items-center gap-4 py-3 hover:bg-secondary/50"
                          >
                            <img
                              src={primaryImage(p)?.src}
                              alt=""
                              width={48}
                              height={64}
                              className="h-16 w-12 shrink-0 bg-muted object-cover"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-medium">{p.name}</span>
                              <span className="block text-xs text-muted-foreground">
                                {categoryName(p.category)}
                              </span>
                            </span>
                            <span className="text-sm tabular-nums">{formatINR(p.price)}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to="/search"
                      search={{ q: deferred }}
                      onClick={close}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
                      See all results for “{deferred}” <ArrowRight className="h-4 w-4" />
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <div className="mt-6">
                <p className="eyebrow text-[0.65rem] text-muted-foreground">Popular</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {POPULAR.map((slug) => {
                    const c = COLLECTIONS.find((x) => x.slug === slug);
                    return c ? (
                      <Link
                        key={slug}
                        to="/collections/$slug"
                        params={{ slug }}
                        onClick={close}
                        className="border px-4 py-2 text-sm hover:border-foreground"
                      >
                        {c.title}
                      </Link>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
