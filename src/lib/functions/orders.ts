import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  type Order,
  listOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  getOrderStats,
} from "@/lib/orders.server";
import { requireAdmin } from "@/lib/auth";

export const listOrdersFn = createServerFn({ method: "GET" })
  .validator(
    z
      .object({
        status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
        q: z.string().optional(),
        sort: z.enum(["newest", "oldest", "total-asc", "total-desc"]).optional(),
      })
      .optional(),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const orders = await listOrders();
    let filtered = orders;

    if (data?.status) {
      filtered = filtered.filter((o) => o.status === data.status);
    }

    const q = (data?.q ?? "").trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((o) => {
        const hay = [o.id, o.customerName, o.customerPhone, o.customerInstagram]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }

    const sort = data?.sort ?? "newest";
    filtered.sort((a, b) => {
      switch (sort) {
        case "newest":
          return b.createdAt - a.createdAt;
        case "oldest":
          return a.createdAt - b.createdAt;
        case "total-asc":
          return a.total - b.total;
        case "total-desc":
          return b.total - a.total;
      }
    });

    return filtered;
  });

export const getOrderFn = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await requireAdmin();
    return getOrderById(data.id);
  });

export const createOrderFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string().min(1).max(120),
      customerName: z.string().min(1).max(200),
      customerPhone: z.string().min(1).max(40),
      customerInstagram: z.string().optional(),
      governorate: z.string().optional(),
      notes: z.string().optional(),
      pickup: z.coerce.number().int().min(0).max(1).optional(),
      address: z.string().min(1).max(400),
      items: z.array(
        z.object({
          name: z.string().min(1).max(200),
          size: z.string().optional(),
          price: z.number().optional(),
          priceLabel: z.string().optional(),
        }),
      ),
      total: z.number().nonnegative(),
    }),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    return createOrder(data as Order);
  });

export const updateOrderStatusFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), status: z.enum(["pending", "confirmed", "completed", "cancelled"]) }))
  .handler(async ({ data }) => {
    await requireAdmin();
    return updateOrderStatus(data.id, data.status);
  });

export const deleteOrderFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await requireAdmin();
    return deleteOrder(data.id);
  });

export const getOrderStatsFn = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  return getOrderStats();
});
