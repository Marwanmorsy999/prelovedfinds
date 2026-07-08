import { getDB } from "./db";

export interface CategoryRow {
  name: string;
  label: string;
  sortOrder: number;
  createdAt: number;
}

export interface Category {
  name: string;
  label: string;
  sortOrder: number;
  createdAt: number;
}

function rowToCategory(row: CategoryRow): Category {
  return {
    name: row.name,
    label: row.label,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
  };
}

export async function listCategories(): Promise<Category[]> {
  const db = getDB();
  const rows = await db
    .prepare("SELECT * FROM categories ORDER BY sortOrder ASC, name ASC")
    .all<CategoryRow>();
  return (rows.results ?? []).map(rowToCategory);
}

export async function createCategory(name: string, label: string): Promise<Category> {
  const db = getDB();
  const now = Date.now();

  // Get the max sortOrder to append at the end
  const maxRow = await db
    .prepare("SELECT COALESCE(MAX(sortOrder), -1) + 1 as nextOrder FROM categories")
    .first<{ nextOrder: number }>();
  const sortOrder = maxRow?.nextOrder ?? 0;

  await db
    .prepare("INSERT INTO categories (name, label, sortOrder, createdAt) VALUES (?, ?, ?, ?)")
    .bind(name, label, sortOrder, now)
    .run();

  return { name, label, sortOrder, createdAt: now };
}

export async function deleteCategory(name: string): Promise<boolean> {
  const db = getDB();
  const res = await db.prepare("DELETE FROM categories WHERE name = ?").bind(name).run();
  return res.success;
}

export async function updateCategory(
  name: string,
  patch: { label?: string; sortOrder?: number },
): Promise<Category | null> {
  const db = getDB();
  const existing = await db
    .prepare("SELECT * FROM categories WHERE name = ?")
    .bind(name)
    .first<CategoryRow>();
  if (!existing) return null;

  const updated = {
    ...existing,
    label: patch.label ?? existing.label,
    sortOrder: patch.sortOrder ?? existing.sortOrder,
  };

  await db
    .prepare("UPDATE categories SET label = ?, sortOrder = ? WHERE name = ?")
    .bind(updated.label, updated.sortOrder, updated.name)
    .run();

  return rowToCategory(updated);
}
