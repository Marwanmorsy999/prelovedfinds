import { getDB, rowToOrder, type OrderRow } from "./db";
import type { Order } from "./products";

export async function listOrders(): Promise<OrderRow[]> {
  const db = getDB();
  const rows = await db
    .prepare("SELECT * FROM orders ORDER BY createdAt DESC")
    .all<OrderRow>();
  return rows.results ?? [];
}

export async function getOrderById(id: string): Promise<Order | null> {
  const db = getDB();
  const row = await db.prepare("SELECT * FROM orders WHERE id = ?").bind(id).first<OrderRow>();
  return row ? rowToOrder(row) : null;
}

export async function createOrder(input: {
  id: string;
  customerName: string;
  customerPhone: string;
  customerInstagram?: string;
  governorate?: string;
  notes?: string;
  pickup?: 0 | 1;
  address: string;
  items: { name: string; size?: string; price?: number; priceLabel?: string }[];
  subtotal: number;
  total: number;
}): Promise<Order> {
  const db = getDB();
  const now = Date.now();
  const order: Order = {
    id: input.id,
    createdAt: now,
    status: "pending",
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    customerInstagram: input.customerInstagram || "",
    notes: input.notes || "",
    pickup: input.pickup ?? 0,
    address: input.address,
    governorate: input.governorate || "",
    items: input.items,
    subtotal: input.subtotal,
    total: input.total,
  };
  await db
    .prepare(
      `INSERT INTO orders (id, createdAt, status, customerName, customerPhone, customerInstagram, notes, pickup, address, governorate, items, subtotal, total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      order.id,
      order.createdAt,
      order.status,
      order.customerName,
      order.customerPhone,
      order.customerInstagram,
      order.notes,
      order.pickup,
      order.address,
      order.governorate,
      JSON.stringify(order.items),
      order.subtotal,
      order.total,
    )
    .run();
  return order;
}

export async function updateOrderStatus(id: string, status: Order["status"]): Promise<Order | null> {
  const db = getDB();
  await db.prepare("UPDATE orders SET status = ? WHERE id = ?").bind(status, id).run();
  return getOrderById(id);
}

export async function deleteOrder(id: string): Promise<boolean> {
  const db = getDB();
  const res = await db.prepare("DELETE FROM orders WHERE id = ?").bind(id).run();
  return res.success;
}

export async function getOrderStats(): Promise<{
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  revenue: number;
  ordersCount: number;
}> {
  const db = getDB();
  const rows = await db
    .prepare(
      `SELECT status, COUNT(*) as count, COALESCE(SUM(total), 0) as revenue FROM orders GROUP BY status`,
    )
    .all<{ status: string; count: number; revenue: number }>();

  const stats = {
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    revenue: 0,
    ordersCount: 0,
  };

  for (const r of rows.results ?? []) {
    const c = r.count ?? 0;
    stats.ordersCount += c;
    switch (r.status) {
      case "pending":
        stats.pending = c;
        break;
      case "confirmed":
        stats.confirmed = c;
        break;
      case "completed":
        stats.completed = c;
        stats.revenue += r.revenue ?? 0;
        break;
      case "cancelled":
        stats.cancelled = c;
        break;
    }
  }

  return stats;
}

export type { Order };
