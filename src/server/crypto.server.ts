/** Web Crypto helpers (available in Node 18+ and Cloudflare Workers — no dependencies). */

const encoder = new TextEncoder();

const toHex = (buf: ArrayBuffer) =>
  [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

export async function hmacSha256Hex(secret: string, message: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toHex(await crypto.subtle.sign("HMAC", key, encoder.encode(message)));
}

export async function sha256Hex(message: string) {
  return toHex(await crypto.subtle.digest("SHA-256", encoder.encode(message)));
}

/** Constant-time comparison so signature checks don't leak timing information. */
export function safeEqual(a: string, b: string) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid misreading over the phone

export function randomCode(length: number) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return [...bytes].map((b) => ALPHABET[b % ALPHABET.length]).join("");
}
