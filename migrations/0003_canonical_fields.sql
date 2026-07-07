ALTER TABLE products ADD COLUMN priceLabel TEXT DEFAULT '';
ALTER TABLE products ADD COLUMN sortOrder INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN description TEXT DEFAULT '';
ALTER TABLE products ADD COLUMN tag TEXT DEFAULT '';
ALTER TABLE products ADD COLUMN condition TEXT DEFAULT '';
ALTER TABLE products ADD COLUMN imageUrl TEXT DEFAULT '';

UPDATE products SET sortOrder = createdAt WHERE sortOrder = 0;

UPDATE products SET
  tag = COALESCE(NULLIF(brand, ''), 'TEE'),
  condition = COALESCE(NULLIF(era, ''), 'Good'),
  description = CASE
    WHEN productId IS NOT NULL AND productId != '[]'
    THEN REPLACE(REPLACE(REPLACE(productId, '["', ''), '"]', ''), '","', '\n')
    ELSE ''
  END;
