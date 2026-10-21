import { useCallback } from "react";
import type { CatalogSearch } from "@/lib/catalog/search-params";

/** Wraps a route's navigate so filter changes replace history and keep the scroll position. */
export function useSetCatalogSearch(
  navigate: (opts: {
    search: (prev: CatalogSearch) => CatalogSearch;
    replace: boolean;
    resetScroll: boolean;
  }) => Promise<void>,
) {
  return useCallback(
    (patch: Partial<CatalogSearch>) =>
      void navigate({
        search: (prev) => ({ ...prev, ...patch }),
        replace: true,
        resetScroll: false,
      }),
    [navigate],
  );
}
