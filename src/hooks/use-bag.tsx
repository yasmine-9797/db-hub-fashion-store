import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { usePersistedState } from "@/hooks/use-persisted-state";
import { findVariant, getProductById, type Product, type Variant } from "@/lib/catalog";

/** Upper bound per line even when stock is plentiful; bulk buyers use the wholesale flow. */
export const MAX_QTY = 20;
const STORAGE_KEY = "dbhub-bag";

type StoredLine = { productId: string; size: string; colour: string; qty: number };

export type BagLine = {
  key: string;
  product: Product;
  variant: Variant | undefined;
  size: string;
  colour: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
  /** Highest quantity allowed right now (stock-capped). 0 when the variant has sold out. */
  maxQty: number;
  available: boolean;
};

export type AddResult = { ok: true; qty: number } | { ok: false; reason: "unavailable" | "limit" };

type BagContextValue = {
  /** False until the saved bag has been read from storage after mount. */
  ready: boolean;
  lines: BagLine[];
  count: number;
  subtotal: number;
  mrpTotal: number;
  hasUnavailable: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (productId: string, size: string, colour: string, qty?: number) => AddResult;
  setQty: (key: string, qty: number) => void;
  changeVariant: (key: string, size: string, colour: string) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const BagContext = createContext<BagContextValue | null>(null);

export const lineKey = (productId: string, size: string, colour: string) =>
  `${productId}:${size}:${colour}`;

const limitFor = (v: Variant | undefined) => (v ? Math.min(v.stock, MAX_QTY) : 0);

/** Accepts the current format and migrates bags saved before colours existed. */
function parseLines(raw: unknown): StoredLine[] | null {
  if (!Array.isArray(raw)) return null;
  return raw.flatMap((item): StoredLine[] => {
    const v = item as Record<string, unknown> | null;
    const productId =
      typeof v?.["productId"] === "string"
        ? v["productId"]
        : typeof v?.["id"] === "string"
          ? v["id"]
          : null;
    if (!productId || typeof v?.["size"] !== "string" || typeof v["qty"] !== "number") return [];
    const colour =
      typeof v["colour"] === "string" ? v["colour"] : getProductById(productId)?.colours[0]?.name;
    return colour
      ? [{ productId, size: v["size"], colour, qty: Math.max(1, Math.round(v["qty"])) }]
      : [];
  });
}

export function BagProvider({ children }: { children: ReactNode }) {
  const [stored, setStored, ready] = usePersistedState<StoredLine[]>(STORAGE_KEY, [], parseLines);
  const [open, setOpen] = useState(false);

  const value = useMemo<BagContextValue>(() => {
    const lines = stored.flatMap((s): BagLine[] => {
      const product = getProductById(s.productId);
      if (!product) return [];
      const variant = findVariant(product, s.size, s.colour);
      const maxQty = limitFor(variant);
      return [
        {
          key: lineKey(s.productId, s.size, s.colour),
          product,
          variant,
          size: s.size,
          colour: s.colour,
          qty: s.qty,
          unitPrice: product.price,
          lineTotal: product.price * s.qty,
          maxQty,
          available: maxQty > 0 && s.qty <= maxQty,
        },
      ];
    });
    const mutate = (key: string, fn: (s: StoredLine) => StoredLine | null) =>
      setStored((prev) =>
        prev.flatMap((s) => (lineKey(s.productId, s.size, s.colour) === key ? (fn(s) ?? []) : [s])),
      );

    return {
      ready,
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((n, l) => n + l.lineTotal, 0),
      mrpTotal: lines.reduce(
        (n, l) => n + Math.max(l.product.compareAtPrice ?? l.unitPrice, l.unitPrice) * l.qty,
        0,
      ),
      hasUnavailable: lines.some((l) => !l.available),
      open,
      setOpen,
      add: (productId, size, colour, qty = 1) => {
        const product = getProductById(productId);
        const limit = limitFor(product && findVariant(product, size, colour));
        if (limit === 0) return { ok: false, reason: "unavailable" };
        const current =
          stored.find((s) => s.productId === productId && s.size === size && s.colour === colour)
            ?.qty ?? 0;
        const next = Math.min(limit, current + qty);
        if (next === current) return { ok: false, reason: "limit" };
        setStored((prev) =>
          prev.some((s) => s.productId === productId && s.size === size && s.colour === colour)
            ? prev.map((s) =>
                s.productId === productId && s.size === size && s.colour === colour
                  ? { ...s, qty: next }
                  : s,
              )
            : [...prev, { productId, size, colour, qty: next }],
        );
        return { ok: true, qty: next };
      },
      setQty: (key, qty) => {
        const line = lines.find((l) => l.key === key);
        const limit = line ? Math.max(1, line.maxQty) : MAX_QTY;
        mutate(key, (s) => ({ ...s, qty: Math.min(limit, Math.max(1, Math.round(qty))) }));
      },
      changeVariant: (key, size, colour) => {
        const line = lines.find((l) => l.key === key);
        if (!line) return;
        const target = lineKey(line.product.id, size, colour);
        if (target === key) return;
        const limit = limitFor(findVariant(line.product, size, colour));
        if (limit === 0) return;
        setStored((prev) => {
          const existing = prev.find((s) => lineKey(s.productId, s.size, s.colour) === target);
          const moved = prev.filter(
            (s) => lineKey(s.productId, s.size, s.colour) !== key && s !== existing,
          );
          return [
            ...moved,
            {
              productId: line.product.id,
              size,
              colour,
              qty: Math.min(limit, line.qty + (existing?.qty ?? 0)),
            },
          ];
        });
      },
      remove: (key) => mutate(key, () => null),
      clear: () => setStored([]),
    };
  }, [ready, stored, setStored, open]);

  return <BagContext.Provider value={value}>{children}</BagContext.Provider>;
}

export function useBag() {
  const bag = useContext(BagContext);
  if (!bag) throw new Error("useBag must be used inside <BagProvider>");
  return bag;
}
