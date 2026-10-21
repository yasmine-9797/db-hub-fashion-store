import { env, isDev } from "../env.server";
import { memoryStore } from "./memory.server";
import { supabaseConfig, supabaseStore } from "./supabase.server";
import type { Store } from "./types.server";

/**
 * Picks where orders and enquiries are saved:
 *  - Supabase when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set (production);
 *  - in-memory during local development (or if ALLOW_MEMORY_STORE=true, for previews only);
 *  - otherwise null — callers must say ordering is unavailable rather than pretend to save.
 */
export function getStore(): Store | null {
  if (supabaseConfig()) return supabaseStore;
  if (isDev() || env("ALLOW_MEMORY_STORE") === "true") return memoryStore;
  return null;
}
