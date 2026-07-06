-- Preloved Finds — initial schema + seed (12 existing products)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  brand TEXT NOT NULL,
  era TEXT NOT NULL,
  price INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EGP',
  availability TEXT NOT NULL,
  size TEXT NOT NULL,
  images TEXT NOT NULL DEFAULT '[]',
  productId TEXT NOT NULL DEFAULT '[]',
  measurements TEXT NOT NULL DEFAULT '[]',
  createdAt INTEGER NOT NULL
);

INSERT INTO products (id, title, brand, era, price, currency, availability, size, images, productId, measurements, createdAt) VALUES
('pe-crosshair-tee', 'Public Enemy Crosshair All-Over Tee', 'Public Enemy', '90s Bootleg', 1450, 'EGP', 'one-left', 'XL', '[]', '["Pre-owned, professionally inspected","Minor signs of wear consistent with age","No holes, no stains"]', '["Chest: 56cm","Length: 72cm","Shoulder: 52cm","Sleeve: 22cm"]', 1700000012000),
('levis-501-black', 'Levi''s 501 Faded Black Denim', 'Levi''s', '90s', 850, 'EGP', 'available', '34x32', '[]', '["Pre-owned, professionally inspected","Minor signs of wear consistent with age","No holes, no stains"]', '["Chest: 56cm","Length: 72cm","Shoulder: 52cm","Sleeve: 22cm"]', 1700000013000),
('nirvana-smiley', 'Nirvana Smiley Face Band Tee', 'Nirvana', '00s Reprint', 950, 'EGP', 'sold', 'L', '[]', '["Pre-owned, professionally inspected","Minor signs of wear consistent with age","No holes, no stains"]', '["Chest: 56cm","Length: 72cm","Shoulder: 52cm","Sleeve: 22cm"]', 1700000014000),
('carhartt-chore', 'Carhartt Detroit Chore Jacket', 'Carhartt', 'Y2K', 1800, 'EGP', 'available', 'M', '[]', '["Pre-owned, professionally inspected","Minor signs of wear consistent with age","No holes, no stains"]', '["Chest: 56cm","Length: 72cm","Shoulder: 52cm","Sleeve: 22cm"]', 1700000015000),
('polo-oxford-blue', 'Polo Ralph Lauren Oxford Button-Up', 'Ralph Lauren', '90s', 620, 'EGP', 'available', 'L', '[]', '["Pre-owned, professionally inspected","Minor signs of wear consistent with age","No holes, no stains"]', '["Chest: 56cm","Length: 72cm","Shoulder: 52cm","Sleeve: 22cm"]', 1700000016000),
('harley-flame-tee', 'Harley Davidson Flame Pocket Tee', 'Harley Davidson', '90s', 1100, 'EGP', 'one-left', 'XXL', '[]', '["Pre-owned, professionally inspected","Minor signs of wear consistent with age","No holes, no stains"]', '["Chest: 56cm","Length: 72cm","Shoulder: 52cm","Sleeve: 22cm"]', 1700000017000),
('dickies-874', 'Dickies 874 Work Trousers', 'Dickies', '00s', 550, 'EGP', 'available', '32x30', '[]', '["Pre-owned, professionally inspected","Minor signs of wear consistent with age","No holes, no stains"]', '["Chest: 56cm","Length: 72cm","Shoulder: 52cm","Sleeve: 22cm"]', 1700000018000),
('tommy-flag-tee', 'Tommy Hilfiger Flag Logo Tee', 'Tommy Hilfiger', '90s', 780, 'EGP', 'available', 'M', '[]', '["Pre-owned, professionally inspected","Minor signs of wear consistent with age","No holes, no stains"]', '["Chest: 56cm","Length: 72cm","Shoulder: 52cm","Sleeve: 22cm"]', 1700000019000),
('wrangler-western', 'Wrangler Pearl-Snap Western Shirt', 'Wrangler', '80s', 680, 'EGP', 'available', 'L', '[]', '["Pre-owned, professionally inspected","Minor signs of wear consistent with age","No holes, no stains"]', '["Chest: 56cm","Length: 72cm","Shoulder: 52cm","Sleeve: 22cm"]', 1700000020000),
('metallica-tour', 'Metallica Load Tour Long Sleeve', 'Metallica', '90s', 1650, 'EGP', 'sold', 'L', '[]', '["Pre-owned, professionally inspected","Minor signs of wear consistent with age","No holes, no stains"]', '["Chest: 56cm","Length: 72cm","Shoulder: 52cm","Sleeve: 22cm"]', 1700000021000),
('champion-hoodie', 'Champion Reverse Weave Hoodie', 'Champion', '90s', 990, 'EGP', 'available', 'XL', '[]', '["Pre-owned, professionally inspected","Minor signs of wear consistent with age","No holes, no stains"]', '["Chest: 56cm","Length: 72cm","Shoulder: 52cm","Sleeve: 22cm"]', 1700000022000),
('dickies-flannel', 'Dickies Heavyweight Flannel Overshirt', 'Dickies', '00s', 720, 'EGP', 'one-left', 'M', '[]', '["Pre-owned, professionally inspected","Minor signs of wear consistent with age","No holes, no stains"]', '["Chest: 56cm","Length: 72cm","Shoulder: 52cm","Sleeve: 22cm"]', 1700000023000);
