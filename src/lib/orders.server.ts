import { getDB } from "@/lib/db";

export interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  customerName: string;
  customerPhone: string;
  governorate: string;
  address: string;
  subtotal: number;
  status: string;
  createdAt: number;
}

export async function createOrder(input: {
  id: string;
  items: OrderItem[];
  customerName: string;
  customerPhone: string;
  governorate: string;
  address: string;
  subtotal: number;
}): Promise<Order> {
  const db = getDB();
  const now = Date.now();
  const order: Order = {
    id: input.id,
    items: input.items,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    governorate: input.governorate,
    address: input.address,
    subtotal: input.subtotal,
    status: "pending",
    createdAt: now,
  };

  await db
    .prepare(
      `INSERT INTO orders (id, items, customerName, customerPhone, governorate, address, subtotal, status, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      order.id,
      JSON.stringify(order.items),
      order.customerName,
      order.customerPhone,
      order.governorate,
      order.address,
      order.subtotal,
      order.status,
      order.createdAt,
    )
    .run();

  return order;
}
