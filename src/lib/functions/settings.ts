import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDB } from "@/lib/db";

export const getSettingFn = createServerFn({ method: "GET" })
  .validator(z.object({ key: z.string().min(1) }))
  .handler(async ({ data }) => {
    const db = getDB();
    const row = await db.prepare("SELECT value FROM settings WHERE key = ?").bind(data.key).first<{ value: string }>();
    return row?.value ?? "";
  });

export const setSettingFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      key: z.string().min(1),
      value: z.string().max(1000),
    }),
  )
  .handler(async ({ data }) => {
    const db = getDB();
    await db
      .prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
      .bind(data.key, data.value)
      .run();
    return { ok: true as const };
  });
