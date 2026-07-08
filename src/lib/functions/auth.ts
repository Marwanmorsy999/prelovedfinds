import { createServerFn } from "@tanstack/react-start";
import {
  getCookie,
  setCookie,
  deleteCookie,
  getRequestHeader,
  getRequestIP,
} from "@tanstack/start-server-core";
import { z } from "zod";
import { verifyPassword, signSessionToken } from "@/lib/auth.ts";

const SESSION_COOKIE = "session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

// Simple in-memory rate limiter: max 5 attempts per IP per 15 minutes.
// For production, replace with a Cloudflare KV-backed counter.
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true; // allowed
  }
  entry.count += 1;
  if (entry.count > MAX_ATTEMPTS) return false; // blocked
  return true;
}

async function issueSession() {
  const token = await signSessionToken();
  setCookie(SESSION_COOKIE, token, {
    httpOnly: true, // prevents JS access — security hardening
    secure: true, // HTTPS only
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

function clearSession() {
  deleteCookie(SESSION_COOKIE, { path: "/" });
}

export const loginFn = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string().min(1) }))
  .handler(async ({ data }) => {
    // Rate limit by IP. `cf-connecting-ip` is the header Cloudflare's edge
    // sets to the real client IP and can't be spoofed by the client (Cloudflare
    // overwrites it), which is why it's checked first.
    const ip =
      getRequestHeader("cf-connecting-ip" as never) ||
      getRequestIP({ xForwardedFor: true }) ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return { ok: false as const, error: "Too many attempts. Please wait 15 minutes." };
    }

    const ok = await verifyPassword(data.password);
    if (!ok) {
      return { ok: false as const, error: "Invalid password" };
    }
    await issueSession();
    return { ok: true as const };
  });

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  clearSession();
  return { ok: true as const };
});
