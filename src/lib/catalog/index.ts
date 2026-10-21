export * from "./types";
export * from "./collections";
export * from "./query";
export { PRODUCTS, ACTIVE_PRODUCTS, CATALOGUE_IS_DEMO } from "./products";

import { ACTIVE_PRODUCTS } from "./products";

export const getProduct = (slug: string) => ACTIVE_PRODUCTS.find((p) => p.slug === slug);
export const getProductById = (id: string) => ACTIVE_PRODUCTS.find((p) => p.id === id);
