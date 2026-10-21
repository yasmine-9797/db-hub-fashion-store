import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Search, SlidersHorizontal, X } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { Breadcrumbs, type Crumb } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/PageShell";
import { ProductGrid } from "@/components/product/ProductCard";
import {
  ACTIVE_PRODUCTS,
  CATALOGUE_IS_DEMO,
  CATEGORIES,
  PRICE_BANDS,
  SORTS,
  TYPE_LABELS,
  categoryName,
  facets,
  filterProducts,
  matchesCollection,
  sortProducts,
  type Collection,
  type ProductType,
  type SortKey,
} from "@/lib/catalog";
import type { CatalogSearch } from "@/lib/catalog/search-params";
import { cn } from "@/lib/utils";

const CHIPS = [
  { slug: "new-arrivals", label: "New Arrivals" },
  ...CATEGORIES.map((c) => ({ slug: c.id as string, label: c.name })),
  { slug: "budget-finds", label: "Budget Finds" },
];

export function CatalogView({
  title,
  description,
  crumbs,
  collection,
  search,
  setSearch,
  chips = true,
}: {
  title: string;
  description?: string | undefined;
  crumbs: Crumb[];
  collection?: Collection | undefined;
  search: CatalogSearch;
  setSearch: (patch: Partial<CatalogSearch>) => void;
  chips?: boolean;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [q, setQ] = useState(search.q ?? "");
  const sort: SortKey = search.sort ?? "featured";

  // Keep the box in sync when the URL changes elsewhere (e.g. header search), and debounce typing into the URL.
  useEffect(() => setQ(search.q ?? ""), [search.q]);
  useEffect(() => {
    if ((search.q ?? "") === q.trim()) return;
    const t = setTimeout(() => setSearch({ q: q.trim() || undefined }), 300);
    return () => clearTimeout(t);
  }, [q, search.q, setSearch]);

  const base = useMemo(
    () =>
      collection
        ? ACTIVE_PRODUCTS.filter((p) => matchesCollection(p, collection))
        : ACTIVE_PRODUCTS,
    [collection],
  );
  const scoped = useMemo(
    () =>
      filterProducts(base, { q: search.q }).filter(
        (p) =>
          (!search.category || p.category === search.category) &&
          (!search.type || p.type === search.type),
      ),
    [base, search.q, search.category, search.type],
  );
  const results = useMemo(
    () =>
      sortProducts(
        filterProducts(scoped, {
          size: search.size,
          colour: search.colour,
          price: search.price,
          inStock: search.stock,
        }),
        sort,
      ),
    [scoped, search.size, search.colour, search.price, search.stock, sort],
  );

  type ActiveFilter = { label: string; clear: Partial<CatalogSearch> };
  const active = (
    [
      search.q ? { label: `“${search.q}”`, clear: { q: undefined } } : null,
      search.category
        ? { label: categoryName(search.category), clear: { category: undefined } }
        : null,
      search.type ? { label: TYPE_LABELS[search.type], clear: { type: undefined } } : null,
      search.size ? { label: `Size ${search.size}`, clear: { size: undefined } } : null,
      search.colour ? { label: search.colour, clear: { colour: undefined } } : null,
      search.price ? { label: PRICE_BANDS[search.price].label, clear: { price: undefined } } : null,
      search.stock ? { label: "In stock", clear: { stock: undefined } } : null,
    ] as (ActiveFilter | null)[]
  ).filter((x): x is ActiveFilter => x !== null);
  const filterCount = active.filter((a) => !("q" in a.clear)).length;
  const clearAll = () => {
    setQ("");
    setSearch({
      q: undefined,
      category: undefined,
      type: undefined,
      size: undefined,
      colour: undefined,
      price: undefined,
      stock: undefined,
    });
  };

  const panel = (
    <FilterPanel
      base={base}
      scoped={scoped}
      search={search}
      setSearch={setSearch}
      collection={collection}
    />
  );

  return (
    <Container className="pb-24 pt-8 lg:pt-10">
      <Breadcrumbs items={crumbs} />
      <h1 className="display mt-5 text-5xl sm:text-6xl md:text-7xl">{title}</h1>
      {description && (
        <p className="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">
        {results.length} {results.length === 1 ? "product" : "products"}
        {CATALOGUE_IS_DEMO &&
          " · illustrative demo catalogue — please confirm availability with us"}
      </p>

      {chips && (
        <div className="relative -mx-5 mt-7 lg:mx-0">
          <nav
            aria-label="Collections"
            className="flex gap-2 overflow-x-auto pb-1 pl-5 pr-12 [scrollbar-width:none] lg:flex-wrap lg:px-0"
          >
            <Link to="/shop" className={chip(!collection)} activeOptions={{ includeSearch: false }}>
              All
            </Link>
            {CHIPS.map((c) => (
              <Link
                key={c.slug}
                to="/collections/$slug"
                params={{ slug: c.slug }}
                className={chip(collection?.slug === c.slug)}
              >
                {c.label}
              </Link>
            ))}
          </nav>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent lg:hidden"
          />
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 lg:mt-8 lg:flex lg:items-center lg:justify-between lg:border-y lg:py-4">
        <label className="relative col-span-2 lg:w-80">
          <span className="sr-only">Search within {title}</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            enterKeyHint="search"
            className="h-11 w-full border border-input bg-background pl-10 pr-3 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary"
          />
        </label>
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="flex h-11 items-center justify-center gap-2 border border-input text-sm lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {filterCount > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground">
              {filterCount}
            </span>
          )}
        </button>
        <label className="flex h-11 min-w-0 items-center gap-2 border border-input bg-background pl-3 transition focus-within:border-primary lg:w-64">
          <span className="eyebrow shrink-0 text-[0.6rem] text-muted-foreground">Sort</span>
          <select
            value={sort}
            onChange={(e) =>
              setSearch({
                sort: e.target.value === "featured" ? undefined : (e.target.value as SortKey),
              })
            }
            className="h-full min-w-0 flex-1 bg-transparent pr-3 text-sm outline-none"
          >
            {Object.entries(SORTS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {active.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {active.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => {
                if ("q" in a.clear) setQ("");
                setSearch(a.clear);
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs hover:bg-secondary/70"
              aria-label={`Remove filter ${a.label}`}
            >
              {a.label}
              <X className="h-3 w-3" />
            </button>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-medium underline underline-offset-4 hover:text-primary"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="mt-8 grid gap-10 lg:mt-10 lg:grid-cols-[230px_1fr]">
        <aside aria-label="Filters" className="hidden lg:block">
          {panel}
        </aside>
        <div>
          {results.length === 0 ? (
            <div className="border border-dashed px-6 py-20 text-center">
              <p className="display text-3xl">Nothing found</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                No products match {active.length ? "these filters" : "this search"}. Try removing a
                filter or searching for a category like “dresses”.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {active.length > 0 && (
                  <button type="button" onClick={clearAll} className="btn-outline">
                    Clear filters
                  </button>
                )}
                <Link to="/shop" className="btn-primary">
                  Shop all
                </Link>
              </div>
            </div>
          ) : (
            <ProductGrid products={results} eagerCount={4} colour={search.colour} />
          )}
        </div>
      </div>

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent
          side="bottom"
          hideClose
          overlayClassName="bg-ink/40 backdrop-blur-[2px]"
          className="flex max-h-[88dvh] flex-col gap-0 rounded-t-2xl p-0"
        >
          <div className="flex items-center justify-between border-b px-5 py-4">
            <SheetTitle className="display text-2xl font-semibold">Filters</SheetTitle>
            <SheetClose
              aria-label="Close filters"
              className="grid h-10 w-10 place-items-center rounded-full hover:bg-secondary"
            >
              <X className="h-5 w-5" />
            </SheetClose>
          </div>
          <SheetDescription className="sr-only">
            Narrow the products by type, size, colour, price and availability.
          </SheetDescription>
          <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-5 py-5">{panel}</div>
          <div className="flex gap-3 border-t px-5 py-4">
            <button
              type="button"
              onClick={clearAll}
              className="btn-outline flex-1 justify-center rounded-lg px-3"
            >
              Clear
            </button>
            <SheetClose className="btn-primary flex-[2] justify-center rounded-lg px-3">
              Show {results.length} {results.length === 1 ? "item" : "items"}
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </Container>
  );
}

const chip = (on: boolean) =>
  cn(
    "eyebrow shrink-0 border px-4 py-2.5 text-[0.65rem] transition-colors",
    on ? "border-primary bg-primary text-primary-foreground" : "hover:border-foreground",
  );

function FilterPanel({
  base,
  scoped,
  search,
  setSearch,
  collection,
}: {
  base: typeof ACTIVE_PRODUCTS;
  scoped: typeof ACTIVE_PRODUCTS;
  search: CatalogSearch;
  setSearch: (patch: Partial<CatalogSearch>) => void;
  collection?: Collection | undefined;
}) {
  // Each option's count = products you'd see if you picked it, given the other filters.
  const count = (patch: Partial<CatalogSearch>) => {
    const s = { ...search, ...patch };
    return filterProducts(base, {
      q: s.q,
      size: s.size,
      colour: s.colour,
      price: s.price,
      inStock: s.stock,
    }).filter((p) => (!s.category || p.category === s.category) && (!s.type || p.type === s.type))
      .length;
  };
  const f = facets(scoped);
  const types = [...new Set(base.map((p) => p.type))] as ProductType[];
  const showCategory = !collection || collection.match.kind !== "category";
  const showType = (!collection || collection.match.kind !== "type") && types.length > 1;
  const row = (on: boolean) =>
    cn(
      "flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors",
      on ? "bg-secondary font-medium text-primary" : "hover:bg-secondary/60",
    );

  return (
    <div className="space-y-8">
      {showCategory && (
        <FilterGroup title="Category">
          {CATEGORIES.filter((c) => base.some((p) => p.category === c.id)).map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={search.category === c.id}
              className={row(search.category === c.id)}
              onClick={() => setSearch({ category: search.category === c.id ? undefined : c.id })}
            >
              {c.name}
              <span className="text-xs text-muted-foreground">{count({ category: c.id })}</span>
            </button>
          ))}
        </FilterGroup>
      )}
      {showType && (
        <FilterGroup title="Type">
          {types.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={search.type === t}
              className={row(search.type === t)}
              onClick={() => setSearch({ type: search.type === t ? undefined : t })}
            >
              {TYPE_LABELS[t]}
              <span className="text-xs text-muted-foreground">{count({ type: t })}</span>
            </button>
          ))}
        </FilterGroup>
      )}
      <FilterGroup title="Size">
        <div className="flex flex-wrap gap-2 px-1">
          {f.sizes.map((s) => (
            <button
              key={s.name}
              type="button"
              aria-pressed={search.size === s.name}
              onClick={() => setSearch({ size: search.size === s.name ? undefined : s.name })}
              className={cn(
                "min-h-10 min-w-11 border px-3 text-sm transition-colors",
                search.size === s.name
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:border-foreground",
              )}
            >
              {s.name}
            </button>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title="Colour">
        {f.colours.map((c) => (
          <button
            key={c.name}
            type="button"
            aria-pressed={search.colour === c.name}
            className={row(search.colour === c.name)}
            onClick={() => setSearch({ colour: search.colour === c.name ? undefined : c.name })}
          >
            <span className="flex items-center gap-2.5">
              <span
                className="h-4 w-4 rounded-full border border-black/10"
                style={{ backgroundColor: c.hex }}
              />
              {c.name}
            </span>
            <span className="text-xs text-muted-foreground">{count({ colour: c.name })}</span>
          </button>
        ))}
      </FilterGroup>
      <FilterGroup title="Price">
        {f.prices.map((p) => (
          <button
            key={p.key}
            type="button"
            aria-pressed={search.price === p.key}
            className={row(search.price === p.key)}
            onClick={() => setSearch({ price: search.price === p.key ? undefined : p.key })}
          >
            {p.label}
            <span className="text-xs text-muted-foreground">{count({ price: p.key })}</span>
          </button>
        ))}
      </FilterGroup>
      <FilterGroup title="Availability">
        <label className="flex cursor-pointer items-center justify-between px-3 py-2 text-sm">
          In stock only
          <input
            type="checkbox"
            checked={Boolean(search.stock)}
            onChange={(e) => setSearch({ stock: e.target.checked || undefined })}
            className="h-4 w-4 accent-primary"
          />
        </label>
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="eyebrow mb-2.5 px-1 text-[0.62rem] text-muted-foreground">{title}</h2>
      <div className="space-y-0.5">{children}</div>
    </section>
  );
}
