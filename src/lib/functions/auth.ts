import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { verifyPassword, issueSession, clearSession } from "@/lib/auth";

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
