import type { Product, Availability } from "./products";
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

declare global {
  var __env__: { DB?: unknown } | undefined;
}

export function getDB(): D1Database {
  const env = globalThis.__env__;
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
  availability: Availability;
  size: string;
  images: string;
  productId: string;
  measurements: string;
  createdAt: number;
}

export function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    title: row.title,
    brand: row.brand,
    era: row.era,
    price: row.price,
    currency: (row.currency || "EGP") as Product["currency"],
    availability: row.availability,
    size: row.size,
    images: safeJsonParse(row.images, []),
    productId: safeJsonParse(row.productId, []),
    measurements: safeJsonParse(row.measurements, []),
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
    createdAt: p.createdAt,
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
