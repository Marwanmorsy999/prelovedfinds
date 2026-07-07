-- Preloved Finds — orders table for checkout
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  items TEXT NOT NULL DEFAULT '[]',
  customerName TEXT NOT NULL,
  customerPhone TEXT NOT NULL,
  governorate TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  subtotal INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  createdAt INTEGER NOT NULL
);
