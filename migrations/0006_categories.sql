-- Categories table for admin-controlled dynamic categories
CREATE TABLE IF NOT EXISTS categories (
  name TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  sortOrder INTEGER NOT NULL DEFAULT 0,
  createdAt INTEGER NOT NULL
);

-- Seed default categories from existing hardcoded values
INSERT OR IGNORE INTO categories (name, label, sortOrder, createdAt) VALUES
  ('TEE', 'TEE', 0, 1700000000000),
  ('SHIRT', 'SHIRT', 1, 1700000000001),
  ('JEANS', 'JEANS', 2, 1700000000002),
  ('PANTS', 'PANTS', 3, 1700000000003),
  ('SHORTS', 'SHORTS', 4, 1700000000004),
  ('OUTERWEAR', 'OUTERWEAR', 5, 1700000000005),
  ('GRAIL', 'GRAIL', 6, 1700000000006),
  ('DROP', 'DROP', 7, 1700000000007),
  ('OTHER', 'OTHER', 8, 1700000000008);