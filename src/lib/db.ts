import type { Product, Availability, Order, Settings } from "./products";
import { getEnv } from "./env";

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
  exec(query: string): Promise<D1Result>;
}
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(col?: string): Promise<T | null>;
  run(): Promise<D1Result>;
  all<T = unknown>(): Promise<{ results: T[] }>;
}
interface D1Result {
  success: boolean;
  error?: string;
  meta: unknown;
}

export function getDB(): D1Database {
  const env = globalThis.__env__ as { DB?: unknown } | undefined;
  const db = env?.DB as D1Database | undefined;
  if (!db) {
    throw new Error(
      "D1 binding 'DB' is not available. Run via `wrangler dev` (not plain vite dev) so the binding is populated.",
    );
  }
  return db;
}

export interface ProductRow {
  id: string;
  title: string;
  brand: string;
  era: string;
  price: number;
  currency: string;
  availability: string;
  size: string;
  images: string;
  productId: string;
  measurements: string;
  createdAt: number;
  priceLabel: string;
  sortOrder: number;
  description: string;
  tag: string;
  condition: string;
  imageUrl: string | null;
}

export function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    title: row.title,
    brand: row.brand,
    era: row.era,
    price: row.price,
    currency: row.currency,
    availability: row.availability as Product["availability"],
    size: row.size,
    images: safeJsonParse(row.images, []),
    productId: safeJsonParse(row.productId, []),
    measurements: safeJsonParse(row.measurements, []),
    priceLabel: row.priceLabel,
    sortOrder: row.sortOrder ?? 0,
    description: row.description,
    tag: row.tag,
    condition: row.condition,
    imageUrl: row.imageUrl || null,
    createdAt: row.createdAt,
  };
}

export function productToRow(p: Product): Omit<ProductRow, "createdAt"> & { createdAt?: number } {
  return {
    id: p.id,
    title: p.title,
    brand: p.brand,
    era: p.era,
    price: p.price,
    currency: p.currency,
    availability: p.availability,
    size: p.size,
    images: JSON.stringify(p.images ?? []),
    productId: JSON.stringify(p.productId ?? []),
    measurements: JSON.stringify(p.measurements ?? []),
    priceLabel: p.priceLabel,
    sortOrder: p.sortOrder ?? 0,
    description: p.description,
    tag: p.tag,
    condition: p.condition,
    imageUrl: p.imageUrl || null,
    createdAt: p.createdAt,
  };
}

export interface OrderRow {
  id: string;
  createdAt: number;
  status: string;
  customerName: string;
  customerPhone: string;
  customerInstagram: string;
  notes: string;
  pickup: number;
  address: string;
  governorate: string;
  subtotal: number;
  items: string;
  total: number;
}

export function rowToOrder(row: OrderRow): Order {
  return {
    id: row.id,
    createdAt: row.createdAt,
    status: row.status as Order["status"],
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    customerInstagram: row.customerInstagram,
    notes: row.notes,
    pickup: row.pickup as 0 | 1,
    address: row.address,
    governorate: row.governorate,
    subtotal: row.subtotal,
    items: safeJsonParse(row.items, []),
    total: row.total,
  };
}

export function orderToRow(o: Order): Omit<OrderRow, "createdAt"> & { createdAt?: number } {
  return {
    id: o.id,
    createdAt: o.createdAt,
    status: o.status,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    customerInstagram: o.customerInstagram,
    notes: o.notes,
    pickup: o.pickup,
    address: o.address,
    governorate: o.governorate ?? "",
    subtotal: o.subtotal ?? 0,
    items: JSON.stringify(o.items ?? []),
    total: o.total,
  };
}

function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function cloudinaryConfig() {
  const env = getEnv();
  return {
    cloudName: env.CLOUDINARY_CLOUD_NAME ?? "",
    preset: env.CLOUDINARY_UNSIGNED_PRESET ?? "",
  };
}
