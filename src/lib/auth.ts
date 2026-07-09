import { createIsomorphicFn } from "@tanstack/react-start";
import { getEnv } from "./env";

const SESSION_COOKIE = "session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function getSecret(): string {
  const s = getEnv().SESSION_SECRET;
  if (!s) {
    // In dev, fall back to a known insecure secret with a loud warning.
    if (import.meta.env?.DEV || process.env.NODE_ENV === "development") {
      console.warn(
        "[auth] SESSION_SECRET is not set — using insecure dev fallback. " +
          "Set SESSION_SECRET in Cloudflare Worker Secrets before deploying.",
      );
      return "dev-insecure-secret-change-me";
    }
    throw new Error(
      "SESSION_SECRET env var is required in production. " +
        "Add it as a Cloudflare Worker Secret: wrangler secret put SESSION_SECRET",
    );
  }
  return s;
}

function toBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

async function hmac(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    toBytes(getSecret()) as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, toBytes(message) as BufferSource);
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function signSessionToken(): Promise<string> {
  const nonce = crypto.randomUUID();
  const payload = `v1.${nonce}`;
  const sig = await hmac(payload);
  return `${payload}.${sig}`;
}

async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return false;
  const payload = `${parts[0]}.${parts[1]}`;
  const expected = await hmac(payload);
  const actual = parts[2];

  // Constant-time comparison for both length and content
  let mismatch = expected.length ^ actual.length;
  for (let i = 0; i < Math.max(expected.length, actual.length); i++) {
    const a = expected.charCodeAt(i) || 0;
    const b = actual.charCodeAt(i) || 0;
    mismatch |= a ^ b;
  }
  return mismatch === 0;
}

const readSessionCookie = createIsomorphicFn()
  .server(async () => {
    const { getCookie } = await import("@tanstack/start-server-core");
    return (getCookie(SESSION_COOKIE) as string | undefined) ?? undefined;
  })
  .client(() => {
    if (typeof document === "undefined") return undefined;
    const match = document.cookie.match(/(?:^|;\s*)session=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : undefined;
  });

export async function getIsAuthed(): Promise<boolean> {
  const token = await readSessionCookie();
  return verifySessionToken(token);
}

export async function requireAdmin(): Promise<void> {
  const authed = await getIsAuthed();
  if (!authed) {
    throw new Error("UNAUTHORIZED");
  }
}

export async function verifyPassword(password: string): Promise<boolean> {
  const expected = getEnv().ADMIN_PASSWORD || "";
  if (!expected) return false;
  const a = toBytes(password);
  const b = toBytes(expected);

  // Constant-time comparison for both length and content
  let mismatch = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    mismatch |= (a[i] || 0) ^ (b[i] || 0);
  }
  return mismatch === 0;
}
