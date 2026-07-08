import type { Product, Availability } from "./products";
import { getDB, rowToProduct, type ProductRow } from "./db";

type SortKey = "newest" | "featured" | "price-asc" | "price-desc";

export interface ListParams {
  tag?: string;
  size?: string;
  condition?: string;
  availability?: Availability | "all";
  priceRange?: "all" | "under-700" | "700-900" | "over-900";
  sort?: SortKey;
  page?: number;
  perPage?: number;
  q?: string;
}

export interface ProductInput {
  id: string;
  title: string;
  price: number;
  priceLabel?: string;
  availability: Availability;
  tag: string;
  condition: string;
  description: string;
  size: string;
  imageUrl?: string | null;
  images?: string[];
  sortOrder?: number;
  brand?: string;
  era?: string;
  currency?: string;
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

  if (params.tag) {
    where.push("tag = ?");
    args.push(params.tag);
  }

  if (params.size) {
    where.push("size = ?");
    args.push(params.size);
  }

  if (params.condition) {
    where.push("condition = ?");
    args.push(params.condition);
  }

  if (params.q?.trim()) {
    const term = `%${params.q.trim()}%`;
    where.push(
      "(title LIKE ? OR brand LIKE ? OR era LIKE ? OR tag LIKE ? OR size LIKE ? OR condition LIKE ? OR description LIKE ?)",
    );
    args.push(term, term, term, term, term, term, term);
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
    case "featured":
      return "ORDER BY sortOrder ASC, createdAt DESC";
    case "newest":
    default:
      return "ORDER BY sortOrder ASC, createdAt DESC";
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
  const row = await db.prepare("SELECT * FROM products WHERE id = ?").bind(id).first<ProductRow>();
  return row ? rowToProduct(row) : null;
}

export async function getRelated(id: string, n = 4): Promise<Product[]> {
  const db = getDB();
  const rows = await db
    .prepare("SELECT * FROM products WHERE id != ? ORDER BY sortOrder ASC, createdAt DESC LIMIT ?")
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
    brand: input.brand ?? "",
    era: input.era ?? "",
    price: input.price,
    currency: input.currency ?? "EGP",
    availability: input.availability,
    size: input.size,
    images: input.images ?? [],
    productId: input.productId ?? [],
    measurements: input.measurements ?? [],
    priceLabel: input.priceLabel ?? "",
    sortOrder: input.sortOrder ?? 0,
    description: input.description,
    tag: input.tag,
    condition: input.condition,
    imageUrl: input.imageUrl ?? null,
    createdAt: now,
  };

  await db
    .prepare(
      `INSERT INTO products (id, title, brand, era, price, currency, availability, size, images, productId, measurements, createdAt, priceLabel, sortOrder, description, tag, condition, imageUrl)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      JSON.stringify(product.images ?? []),
      JSON.stringify(product.productId ?? []),
      JSON.stringify(product.measurements ?? []),
      product.createdAt,
      product.priceLabel,
      product.sortOrder,
      product.description,
      product.tag,
      product.condition,
      product.imageUrl,
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
    brand: input.brand ?? "",
    era: input.era ?? "",
    price: input.price,
    currency: input.currency ?? "EGP",
    availability: input.availability,
    size: input.size,
    images: input.images ?? [],
    productId: input.productId ?? [],
    measurements: input.measurements ?? [],
    priceLabel: input.priceLabel ?? "",
    sortOrder: input.sortOrder ?? 0,
    description: input.description,
    tag: input.tag,
    condition: input.condition,
    imageUrl: input.imageUrl ?? null,
    createdAt: now + i,
  }));

  const stmt = db.prepare(
    `INSERT INTO products (id, title, brand, era, price, currency, availability, size, images, productId, measurements, createdAt, priceLabel, sortOrder, description, tag, condition, imageUrl)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        JSON.stringify(p.images ?? []),
        JSON.stringify(p.productId ?? []),
        JSON.stringify(p.measurements ?? []),
        p.createdAt,
        p.priceLabel,
        p.sortOrder,
        p.description,
        p.tag,
        p.condition,
        p.imageUrl,
      ),
    ),
  );

  return products;
}

export async function deleteSoldProducts(): Promise<number> {
  const db = getDB();
  const res = await db.prepare("DELETE FROM products WHERE availability = 'sold'").run();
  return (res.meta as { changes?: number | undefined } | undefined)?.changes ?? 0;
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
    title: patch.title ?? existing.title,
    brand: patch.brand ?? existing.brand,
    era: patch.era ?? existing.era,
    price: patch.price ?? existing.price,
    currency: patch.currency ?? existing.currency,
    availability: patch.availability ?? existing.availability,
    size: patch.size ?? existing.size,
    images: patch.images ?? existing.images,
    productId: patch.productId ?? existing.productId,
    measurements: patch.measurements ?? existing.measurements,
    priceLabel: patch.priceLabel ?? existing.priceLabel,
    sortOrder: patch.sortOrder ?? existing.sortOrder,
    description: patch.description ?? existing.description,
    tag: patch.tag ?? existing.tag,
    condition: patch.condition ?? existing.condition,
    imageUrl: patch.imageUrl ?? existing.imageUrl,
  };

  await getDB()
    .prepare(
      `UPDATE products
       SET title = ?, brand = ?, era = ?, price = ?, currency = ?, availability = ?, size = ?, images = ?, productId = ?, measurements = ?, priceLabel = ?, sortOrder = ?, description = ?, tag = ?, condition = ?, imageUrl = ?
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
      JSON.stringify(merged.images ?? []),
      JSON.stringify(merged.productId ?? []),
      JSON.stringify(merged.measurements ?? []),
      merged.priceLabel,
      merged.sortOrder ?? 0,
      merged.description,
      merged.tag,
      merged.condition,
      merged.imageUrl,
      merged.id,
    )
    .run();

  return merged;
}

export async function reorderProducts(orderedIds: string[]): Promise<void> {
  const db = getDB();
  const stmt = db.prepare("UPDATE products SET sortOrder = ? WHERE id = ?");
  const batch = orderedIds.map((id, idx) => stmt.bind(idx, id));
  await db.batch(batch);
}

export async function deleteProduct(id: string): Promise<boolean> {
  const res = await getDB().prepare("DELETE FROM products WHERE id = ?").bind(id).run();
  return res.success;
}

export async function getDashboardStats(): Promise<{
  total: number;
  available: number;
  sold: number;
  oneLeft: number;
  revenue: number;
  avgOrderValue: number;
  avgOrderCount: number;
  topTags: { tag: string; count: number }[];
}> {
  const db = getDB();
  const rows = await db
    .prepare(
      `SELECT availability, COUNT(*) as count, SUM(CASE WHEN availability = 'sold' THEN price ELSE 0 END) as revenue
       FROM products GROUP BY availability`,
    )
    .all<{ availability: string; count: number; revenue: number | null }>();

  const stats: {
    total: number;
    available: number;
    sold: number;
    oneLeft: number;
    revenue: number;
    avgOrderValue: number;
    avgOrderCount: number;
    topTags: { tag: string; count: number }[];
  } = {
    total: 0,
    available: 0,
    sold: 0,
    oneLeft: 0,
    revenue: 0,
    avgOrderValue: 0,
    avgOrderCount: 0,
    topTags: [],
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

  const orderStatsRows = await db
    .prepare(
      `SELECT COUNT(*) as count, COALESCE(AVG(total), 0) as avg, COALESCE(SUM(total), 0) as revenue
       FROM orders WHERE status = 'completed'`,
    )
    .all<{ count: number; avg: number; revenue: number }>();
  const orderStats = orderStatsRows.results?.[0];
  if (orderStats) {
    stats.avgOrderValue = orderStats.avg ?? 0;
    stats.avgOrderCount = orderStats.count ?? 0;
  }

  const tagRows = await db
    .prepare(
      `SELECT tag, COUNT(*) as count FROM products WHERE tag != '' GROUP BY tag ORDER BY count DESC LIMIT 5`,
    )
    .all<{ tag: string; count: number }>();
  stats.topTags = (tagRows.results ?? []).map((r) => ({ tag: r.tag, count: r.count }));

  return stats;
}

export async function getDistinctTags(): Promise<string[]> {
  const db = getDB();
  const rows = await db
    .prepare(`SELECT DISTINCT tag FROM products WHERE tag != '' ORDER BY tag ASC`)
    .all<{ tag: string }>();
  return (rows.results ?? []).map((r) => r.tag);
}

export async function getDistinctSizes(): Promise<string[]> {
  const db = getDB();
  const rows = await db
    .prepare(`SELECT DISTINCT size FROM products WHERE size != '' ORDER BY size ASC`)
    .all<{ size: string }>();
  return (rows.results ?? []).map((r) => r.size);
}

export async function getDistinctConditions(): Promise<string[]> {
  const db = getDB();
  const rows = await db
    .prepare(`SELECT DISTINCT condition FROM products WHERE condition != '' ORDER BY condition ASC`)
    .all<{ condition: string }>();
  return (rows.results ?? []).map((r) => r.condition);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const db = getDB();
  const searchTerm = `%${query}%`;
  const rows = await db
    .prepare(
      `SELECT * FROM products
       WHERE title LIKE ? OR brand LIKE ? OR era LIKE ? OR tag LIKE ? OR size LIKE ? OR condition LIKE ? OR id LIKE ?
       ORDER BY sortOrder ASC, createdAt DESC
       LIMIT 50`,
    )
    .bind(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm)
    .all<ProductRow>();
  return (rows.results ?? []).map(rowToProduct);
}
