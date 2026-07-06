import type { Product, Availability } from "./products";
import { getDB, rowToProduct, type ProductRow } from "./db";

export type SortKey = "featured" | "price-asc" | "price-desc" | "newest";

export interface ListParams {
  availability?: Availability | "all";
  priceRange?: "all" | "under-700" | "700-900" | "over-900";
  sort?: SortKey;
  page?: number;
  perPage?: number;
  /** Full-text search across title, brand, era, size */
  q?: string;
}

export interface ProductInput {
  id: string;
  title: string;
  brand: string;
  era: string;
  price: number;
  currency?: "EGP";
  availability: Availability;
  size: string;
  images?: string[];
  productId?: string[];
  measurements?: string[];
}

export interface ListResult {
  items: Product[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

function buildWhere(params: ListParams): { clause: string; args: unknown[] } {
  const where: string[] = [];
  const args: unknown[] = [];

  if (params.availability && params.availability !== "all") {
    where.push("availability = ?");
    args.push(params.availability);
  }

  if (params.priceRange === "under-700") {
    where.push("price < ?");
    args.push(700);
  } else if (params.priceRange === "700-900") {
    where.push("price >= ? AND price <= ?");
    args.push(700, 900);
  } else if (params.priceRange === "over-900") {
    where.push("price > ?");
    args.push(900);
  }

  // Server-side full-text search across key columns
  if (params.q?.trim()) {
    const term = `%${params.q.trim()}%`;
    where.push("(title LIKE ? OR brand LIKE ? OR era LIKE ? OR size LIKE ?)");
    args.push(term, term, term, term);
  }

  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { clause, args };
}

function sortSql(sort: SortKey | undefined): string {
  switch (sort) {
    case "price-asc":
      return "ORDER BY price ASC";
    case "price-desc":
      return "ORDER BY price DESC";
    case "newest":
      return "ORDER BY createdAt DESC";
    case "featured":
    default:
      return "ORDER BY createdAt DESC";
  }
}

export async function listProducts(params: ListParams = {}): Promise<ListResult> {
  const perPage = Math.max(1, params.perPage ?? 8);
  const page = Math.max(1, params.page ?? 1);
  const { clause, args } = buildWhere(params);
  const sort = sortSql(params.sort);

  const db = getDB();
  const countRow = await db
    .prepare(`SELECT COUNT(*) as count FROM products ${clause}`)
    .bind(...args)
    .first<{ count: number }>();

  const total = countRow?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const rows = await db
    .prepare(`SELECT * FROM products ${clause} ${sort} LIMIT ? OFFSET ?`)
    .bind(...args, perPage, (page - 1) * perPage)
    .all<ProductRow>();

  return {
    items: (rows.results ?? []).map(rowToProduct),
    total,
    page,
    perPage,
    totalPages,
  };
}

export async function getProductById(id: string): Promise<Product | null> {
  const db = getDB();
  const row = await db
    .prepare("SELECT * FROM products WHERE id = ?")
    .bind(id)
    .first<ProductRow>();
  return row ? rowToProduct(row) : null;
}

export async function getRelated(id: string, n = 4): Promise<Product[]> {
  const db = getDB();
  const rows = await db
    .prepare("SELECT * FROM products WHERE id != ? ORDER BY createdAt DESC LIMIT ?")
    .bind(id, n)
    .all<ProductRow>();
  return (rows.results ?? []).map(rowToProduct);
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const db = getDB();
  const now = Date.now();
  const product: Product = {
    id: input.id,
    title: input.title,
    brand: input.brand,
    era: input.era,
    price: input.price,
    currency: input.currency ?? "EGP",
    availability: input.availability,
    size: input.size,
    images: input.images ?? [],
    productId: input.productId ?? [],
    measurements: input.measurements ?? [],
    createdAt: now,
  };

  await db
    .prepare(
      `INSERT INTO products (id, title, brand, era, price, currency, availability, size, images, productId, measurements, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      product.id,
      product.title,
      product.brand,
      product.era,
      product.price,
      product.currency,
      product.availability,
      product.size,
      JSON.stringify(product.images),
      JSON.stringify(product.productId),
      JSON.stringify(product.measurements),
      product.createdAt,
    )
    .run();

  return product;
}

export async function createProducts(inputs: ProductInput[]): Promise<Product[]> {
  const db = getDB();
  const now = Date.now();
  const products: Product[] = inputs.map((input, i) => ({
    id: input.id,
    title: input.title,
    brand: input.brand,
    era: input.era,
    price: input.price,
    currency: input.currency ?? "EGP",
    availability: input.availability,
    size: input.size,
    images: input.images ?? [],
    productId: input.productId ?? [],
    measurements: input.measurements ?? [],
    createdAt: now + i,
  }));

  const stmt = db.prepare(
    `INSERT INTO products (id, title, brand, era, price, currency, availability, size, images, productId, measurements, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  await db.batch(
    products.map((p) =>
      stmt.bind(
        p.id,
        p.title,
        p.brand,
        p.era,
        p.price,
        p.currency,
        p.availability,
        p.size,
        JSON.stringify(p.images),
        JSON.stringify(p.productId),
        JSON.stringify(p.measurements),
        p.createdAt,
      ),
    ),
  );

  return products;
}

export async function deleteSoldProducts(): Promise<number> {
  const db = getDB();
  const res = await db.prepare("DELETE FROM products WHERE availability = 'sold'").run();
  return (res.meta as { changes?: number } | undefined)?.changes ?? 0;
}

export async function updateProduct(
  id: string,
  patch: Partial<ProductInput>,
): Promise<Product | null> {
  const existing = await getProductById(id);
  if (!existing) return null;

  const merged: Product = {
    ...existing,
    ...patch,
    id: existing.id,
    currency: patch.currency ?? existing.currency,
    images: patch.images ?? existing.images,
    productId: patch.productId ?? existing.productId,
    measurements: patch.measurements ?? existing.measurements,
  };

  await getDB()
    .prepare(
      `UPDATE products
       SET title = ?, brand = ?, era = ?, price = ?, currency = ?, availability = ?, size = ?, images = ?, productId = ?, measurements = ?
       WHERE id = ?`,
    )
    .bind(
      merged.title,
      merged.brand,
      merged.era,
      merged.price,
      merged.currency,
      merged.availability,
      merged.size,
      JSON.stringify(merged.images),
      JSON.stringify(merged.productId),
      JSON.stringify(merged.measurements),
      merged.id,
    )
    .run();

  return merged;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const res = await getDB().prepare("DELETE FROM products WHERE id = ?").bind(id).run();
  return res.success;
}

export async function toggleSold(id: string): Promise<Product | null> {
  const existing = await getProductById(id);
  if (!existing) return null;
  const next: Availability = existing.availability === "sold" ? "available" : "sold";
  return updateProduct(id, { availability: next });
}

export interface DashboardStats {
  total: number;
  available: number;
  sold: number;
  oneLeft: number;
  revenue: number;
  topBrands: { brand: string; count: number }[];
  recentRevenue: number;
  averagePrice: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = getDB();
  const rows = await db
    .prepare(
      `SELECT availability, COUNT(*) as count, SUM(CASE WHEN availability = 'sold' THEN price ELSE 0 END) as revenue
       FROM products GROUP BY availability`,
    )
    .all<{ availability: Availability; count: number; revenue: number | null }>();

  const stats: DashboardStats = {
    total: 0,
    available: 0,
    sold: 0,
    oneLeft: 0,
    revenue: 0,
    topBrands: [],
    recentRevenue: 0,
    averagePrice: 0,
  };

  for (const r of rows.results ?? []) {
    const count = r.count ?? 0;
    stats.total += count;
    if (r.availability === "available") stats.available = count;
    if (r.availability === "sold") {
      stats.sold = count;
      stats.revenue = r.revenue ?? 0;
    }
    if (r.availability === "one-left") stats.oneLeft = count;
  }

  const brandRows = await db
    .prepare(
      `SELECT brand, COUNT(*) as count FROM products WHERE brand != '' GROUP BY brand ORDER BY count DESC LIMIT 5`,
    )
    .all<{ brand: string; count: number }>();
  stats.topBrands = (brandRows.results ?? []).map((r) => ({ brand: r.brand, count: r.count }));

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentRow = await db
    .prepare(
      `SELECT COALESCE(SUM(price), 0) as revenue FROM products WHERE availability = 'sold' AND createdAt >= ?`,
    )
    .bind(thirtyDaysAgo)
    .first<{ revenue: number }>();
  stats.recentRevenue = recentRow?.revenue ?? 0;

  const avgRow = await db
    .prepare(
      `SELECT COALESCE(ROUND(AVG(price)), 0) as avg FROM products WHERE availability IN ('available', 'one-left')`,
    )
    .first<{ avg: number }>();
  stats.averagePrice = avgRow?.avg ?? 0;

  return stats;
}

export async function searchProducts(query: string): Promise<Product[]> {
  const db = getDB();
  const searchTerm = `%${query}%`;
  const rows = await db
    .prepare(
      `SELECT * FROM products
       WHERE title LIKE ? OR brand LIKE ? OR era LIKE ? OR size LIKE ? OR id LIKE ?
       ORDER BY createdAt DESC
       LIMIT 50`,
    )
    .bind(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm)
    .all<ProductRow>();
  return (rows.results ?? []).map(rowToProduct);
}
