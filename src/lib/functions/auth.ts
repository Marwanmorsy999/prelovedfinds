import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie, deleteCookie } from "@tanstack/start-server-core";
import { z } from "zod";
import { verifyPassword, signSessionToken } from "@/lib/auth";

const SESSION_COOKIE = "session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

async function issueSession() {
  const token = await signSessionToken();
  setCookie(SESSION_COOKIE, token, {
    httpOnly: false,
    sameSite: "lax",
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
