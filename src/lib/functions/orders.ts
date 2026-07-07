import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createOrder, type Order, type OrderItem } from "@/lib/orders.server";

const phoneRegex = /^01[0-2,5]{1}[0-9]{7}$/;

const orderInputSchema = z.object({
  id: z.string().min(1).max(120),
  items: z
    .array(
      z.object({
        id: z.string().min(1).max(120),
        title: z.string().min(1).max(200),
        price: z.number().int().positive(),
        quantity: z.number().int().positive().default(1),
      }),
    )
    .min(1),
  customerName: z.string().min(1).max(200),
  customerPhone: z.string().regex(phoneRegex, "Invalid Egyptian phone number"),
  governorate: z.string().min(1).max(120),
  address: z.string().max(500).optional().default(""),
  subtotal: z.number().int().nonNegative(),
});

export const createOrderFn = createServerFn({ method: "POST" })
  .validator(orderInputSchema)
  .handler(async ({ data }) => {
    return createOrder({
      id: data.id,
      items: data.items as OrderItem[],
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      governorate: data.governorate,
      address: data.address || "",
      subtotal: data.subtotal,
    });
  });
