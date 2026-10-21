/**
 * Server-only environment access. Works in Node (local dev, Node hosting) and on Cloudflare
 * Workers, where the deploy target exposes bindings via process.env (nodejs_compat) or __env__.
 * Never import this from browser code — the `.server.ts` suffix makes the build refuse it.
 */
export function env(name: string): string | undefined {
  const fromProcess = typeof process !== "undefined" ? process.env?.[name] : undefined;
  const fromBindings = (globalThis as { __env__?: Record<string, unknown> }).__env__?.[name];
  const value = fromProcess ?? (typeof fromBindings === "string" ? fromBindings : undefined);
  return value && value.trim() ? value.trim() : undefined;
}

export const isDev = () => import.meta.env.DEV;
