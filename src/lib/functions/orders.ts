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
import { getProductById, updateProduct } from "@/lib/products.server";
import { rowToOrder } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// Shipping cost by governorate, mirrored from the checkout UI (src/routes/checkout.tsx).
// Duplicated here deliberately: the server must never trust a shipping cost the
// client sends, only recompute it itself from the governorate name.
const SHIPPING_ZONE_A = new Set([
  "Cairo",
  "Giza",
  "Qalyubia",
  "Alexandria",
  "Beheira",
  "Monufia",
  "Gharbia",
  "Kafr El Sheikh",
  "Dakahlia",
  "Sharqia",
  "Damietta",
  "Port Said",
  "Ismailia",
  "Suez",
]);
const SHIPPING_ZONE_B = new Set([
  "Beni Suef",
  "Faiyum",
  "Minya",
  "Asyut",
  "Sohag",
  "Qena",
  "Luxor",
  "Aswan",
  "Red Sea",
  "New Valley",
  "Matrouh",
  "North Sinai",
  "South Sinai",
]);
function shippingCostFor(governorate: string | undefined): number {
  if (!governorate) return 0;
  if (SHIPPING_ZONE_A.has(governorate)) return 100;
  if (SHIPPING_ZONE_B.has(governorate)) return 150;
  return 100;
}

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
    const rows = await listOrders();
    let filtered = rows.map(rowToOrder);

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
      // The client only needs to tell us *which* products it wants; price,
      // priceLabel, subtotal, and total are never trusted from the client —
      // see the handler below, which re-derives all of that from the DB.
      items: z
        .array(z.object({ id: z.string().min(1) }))
        .min(1)
        .max(50),
    }),
  )
  .handler(async ({ data }) => {
    // Re-fetch every product from the database so price/availability can't be
    // spoofed by a client calling this server function directly. Previously
    // this handler trusted client-supplied `price`, `subtotal`, and `total`
    // values verbatim, letting anyone place an order at an arbitrary price.
    const products = await Promise.all(data.items.map((i) => getProductById(i.id)));

    const missing = data.items.filter((_, idx) => !products[idx]);
    if (missing.length > 0) {
      throw new Error("One or more items in your cart are no longer available.");
    }

    const sold = products.filter((p) => p?.availability === "sold");
    if (sold.length > 0) {
      throw new Error(
        `"${sold[0]?.title}" was already sold. Please remove it from your cart and try again.`,
      );
    }

    const orderItems = products.map((p) => ({
      name: p!.title,
      size: p!.size,
      price: p!.price,
      priceLabel: p!.priceLabel,
    }));

    const subtotal = orderItems.reduce((sum, i) => sum + i.price, 0);
    const shippingCost = shippingCostFor(data.governorate);
    const total = subtotal + shippingCost;

    const order = await createOrder({
      id: data.id,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerInstagram: data.customerInstagram,
      governorate: data.governorate,
      notes: data.notes,
      pickup: data.pickup as 0 | 1 | undefined,
      address: data.address,
      items: orderItems,
      subtotal,
      total,
    });

    // Every listing is a single, one-off vintage item, so placing an order
    // must immediately take it off the shelf — otherwise two customers can
    // race to buy the same piece before an admin manually marks it sold.
    // (Note: on Cloudflare D1 this isn't a full transaction — see the
    // accompanying report for the race-condition caveat and recommended
    // follow-up if concurrent orders on the same item become common.)
    await Promise.all(data.items.map((i) => updateProduct(i.id, { availability: "sold" })));

    return order;
  });

export const updateOrderStatusFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string(),
      status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
    }),
  )
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
