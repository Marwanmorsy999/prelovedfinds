import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDB } from "@/lib/db";

export const submitContactFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      name: z.string().min(1),
      email: z.string().email(),
      message: z.string().min(1),
      phone: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const db = getDB();
    await db
      .prepare(
        "INSERT INTO contact_submissions (name, email, phone, message, created_at) VALUES (?, ?, ?, ?, ?)",
      )
      .bind(data.name, data.email, data.phone ?? "", data.message, Date.now())
      .run();
    return { ok: true as const };
  });