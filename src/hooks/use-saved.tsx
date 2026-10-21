import { createContext, useContext, useMemo, type ReactNode } from "react";
import { usePersistedState } from "@/hooks/use-persisted-state";
import { PRODUCTS } from "@/lib/catalog";

type SavedContextValue = {
  /** False until saved items have been read from storage after mount. */
  ready: boolean;
  /** Saved product ids that still exist in the catalogue, oldest first. */
  ids: string[];
  isSaved: (id: string) => boolean;
  toggle: (id: string) => void;
};

const SavedContext = createContext<SavedContextValue | null>(null);

const parseIds = (raw: unknown) =>
  Array.isArray(raw) ? raw.filter((id): id is string => typeof id === "string") : null;

export function SavedProvider({ children }: { children: ReactNode }) {
  const [stored, setStored, ready] = usePersistedState<string[]>("dbhub-saved", [], parseIds);

  const value = useMemo<SavedContextValue>(() => {
    const ids = stored.filter((id) => PRODUCTS.some((p) => p.id === id));
    return {
      ready,
      ids,
      isSaved: (id) => ids.includes(id),
      toggle: (id) =>
        setStored((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
    };
  }, [ready, stored, setStored]);

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved() {
  const saved = useContext(SavedContext);
  if (!saved) throw new Error("useSaved must be used inside <SavedProvider>");
  return saved;
}
