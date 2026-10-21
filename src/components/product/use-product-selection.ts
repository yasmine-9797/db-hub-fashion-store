import { useState } from "react";
import { toast } from "sonner";
import { MAX_QTY, useBag } from "@/hooks/use-bag";
import { colourInStock, findVariant, sizeInStock, type Product } from "@/lib/catalog";
import { productMessage } from "@/lib/whatsapp";

/** Size/colour/quantity selection with stock rules, shared by the product page and quick view. */
export function useProductSelection(product: Product, initialColour?: string | null) {
  const bag = useBag();
  // Start on the colour the shopper picked elsewhere (card dot, link), if the product has it.
  const preferred =
    initialColour && product.colours.some((c) => c.name === initialColour) ? initialColour : null;
  const firstColour =
    preferred ??
    product.colours.find((c) => colourInStock(product, c.name))?.name ??
    product.colours[0]?.name ??
    null;
  const onlySize = product.sizes.length === 1 ? product.sizes[0]! : null;
  const [colour, setColourState] = useState<string | null>(firstColour);
  const [size, setSizeState] = useState<string | null>(
    onlySize && sizeInStock(product, onlySize, firstColour ?? undefined) ? onlySize : null,
  );
  const [qty, setQtyState] = useState(1);
  const [error, setError] = useState<string | undefined>();

  const variant = size && colour ? findVariant(product, size, colour) : undefined;
  const stock = variant?.stock ?? 0;
  const maxQty = Math.max(1, Math.min(stock || MAX_QTY, MAX_QTY));
  const soldOut = !product.variants.some((v) => v.stock > 0);

  const setColour = (c: string) => {
    setColourState(c);
    setError(undefined);
    // Drop a size that isn't available in the new colour rather than silently keeping it.
    if (size && !sizeInStock(product, size, c)) setSizeState(null);
  };
  const setSize = (s: string) => {
    setSizeState(s);
    setError(undefined);
  };
  const setQty = (n: number) => setQtyState(Math.min(maxQty, Math.max(1, n)));

  /** Validates the selection and adds it; returns true when the bag changed. */
  const add = (): boolean => {
    if (!colour) {
      setError("Please choose a colour.");
      return false;
    }
    if (!size) {
      setError("Please choose a size.");
      return false;
    }
    if (!variant || variant.stock === 0) {
      setError(`Size ${size} is sold out in ${colour}.`);
      return false;
    }
    const result = bag.add(product.id, size, colour, qty);
    if (!result.ok) {
      setError(
        result.reason === "limit"
          ? `You already have the most we can sell of size ${size} in your bag.`
          : `Size ${size} is sold out in ${colour}.`,
      );
      return false;
    }
    setError(undefined);
    toast.success("Added to bag", {
      description: `${product.name} · ${colour} · ${size}`,
      action: { label: "View bag", onClick: () => bag.setOpen(true) },
    });
    return true;
  };

  const whatsappText = (url?: string) =>
    productMessage({
      name: product.name,
      sku: variant?.sku,
      size: size ?? undefined,
      colour: colour ?? undefined,
      qty,
      price: product.price,
      url,
    });

  return {
    colour,
    size,
    qty,
    setColour,
    setSize,
    setQty,
    variant,
    stock,
    maxQty,
    soldOut,
    error,
    add,
    whatsappText,
  };
}
