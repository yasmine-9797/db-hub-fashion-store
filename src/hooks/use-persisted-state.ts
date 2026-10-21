import { useEffect, useState } from "react";

/**
 * useState backed by localStorage. The saved value is read after mount so the server
 * render and the first client render match. `parse` must be a stable (module-level)
 * function that returns null for anything it does not recognise.
 */
export function usePersistedState<T>(key: string, initial: T, parse: (raw: unknown) => T | null) {
  const [value, setValue] = useState(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = parse(JSON.parse(localStorage.getItem(key) ?? "null"));
      if (saved !== null) setValue(saved);
    } catch {
      // Storage can be unavailable (private mode, blocked site data); keep the initial value.
    }
    setLoaded(true);
  }, [key, parse]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Not persisting is fine; the state still works for this visit.
    }
  }, [key, value, loaded]);

  return [value, setValue, loaded] as const;
}
