import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// Settings keys are an explicit allow-list so this endpoint can never be used
// to write arbitrary rows into the settings table.
const SETTING_KEYS = ["announcement", "whatsapp"] as const;
const settingKeySchema = z.enum(SETTING_KEYS);

// Reading a setting (e.g. the announcement banner) is public by design —
// it's rendered on the public storefront.
export const getSettingFn = createServerFn({ method: "GET" })
  .validator(z.object({ key: settingKeySchema }))
  .handler(async ({ data }) => {
    const db = getDB();
    const row = await db
      .prepare("SELECT value FROM settings WHERE key = ?")
      .bind(data.key)
      .first<{ value: string }>();
    return row?.value ?? "";
  });

// Writing a setting is an admin-only action. This was previously missing a
// `requireAdmin()` check, which meant anyone could call this server function
// directly (bypassing the UI entirely) to overwrite the site announcement or
// WhatsApp contact number — a stored content-injection / defacement bug.
export const setSettingFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      key: settingKeySchema,
      value: z.string().max(1000),
    }),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = getDB();
    await db
      .prepare(
        "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      )
      .bind(data.key, data.value)
      .run();
    return { ok: true as const };
  });
