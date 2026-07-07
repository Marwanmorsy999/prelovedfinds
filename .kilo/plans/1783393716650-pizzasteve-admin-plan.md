# Preloved Finds — Canonical schema: clone Pizza Steve

## Goal
Adopt the Pizza Steve `Product` / `Order` / `Settings` shape as the **single canonical schema** for Preloved. Replace Preloved's old `brand`/`era`/`productId[]` model completely. The Pizza Steve category set and condition set become the fixed vocabularies for every public page, admin page, and D1 query.

## Canonical fields (from Pizza Steve)

Product:
- `id`: string (admin slug, URL-safe, unique)
- `name`: string
- `size`: string
- `price`: number (EGP integer; optional because `priceLabel` can override display)
- `priceLabel`: string (optional override, e.g. "DM price")
- `status`: enum - `available` | `one-left` | `sold`
- `tag`: string (canonical category; fixed vocab below)
- `condition`: string (canonical condition; fixed vocab below)
- `description`: string (newline-joined bullets; replaces `productId[]`)
- `imageUrl`: string | null (main image)
- `images`: string[] (extra images)
- `sortOrder`: number (integer, admin drag-reorder; default 0)
- `emoji`: string (admin fallback only, not shown on public pages)
- createdAt: number (epoch ms)

Fixed category vocab (apply everywhere — shop tiles, admin form, filters):
`TEE`, `JORTS`, `ACCESSORIES`, `DROP`, `GRAIL`, `OUTERWEAR`, `PANTS`, `SHIRT`

Fixed condition vocab:
`Deadstock`, `Perfect`, `Good`, `Fair`

Order:
- `id`: string
- `createdAt`: number (epoch ms)
- `status`: enum - `pending` | `confirmed` | `completed` | `cancelled`
- `customerName`: string
- `customerPhone`: string
- `customerInstagram`: string
- `notes`: string
- `pickup`: 0|1 (1 = Zamalek pickup, 0 = delivery)
- `address`: string
- `items`: JSON array `{ name, size?, price?, priceLabel? }`
- `total`: number (EGP)

Settings (key/value):
- `announcement`: string
- `whatsapp`: string

## DB migration plan

### 1. `products` alter (`.wrangler/migrations/NNNN_add_canonical_fields.sql`)
```sql
ALTER TABLE products ADD COLUMN priceLabel TEXT DEFAULT '';
ALTER TABLE products ADD COLUMN sortOrder INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN description TEXT DEFAULT '';
ALTER TABLE products ADD COLUMN tag TEXT DEFAULT '';
ALTER TABLE products ADD COLUMN condition TEXT DEFAULT '';
ALTER TABLE products ADD COLUMN imageUrl TEXT DEFAULT '';
-- Remove admin-only fields if they were never used (emoji)

-- Backfill sortOrder
UPDATE products SET sortOrder = createdAt WHERE sortOrder = 0;

-- Migrate existing data:
-- brand -> tag
-- era -> condition
-- productId JSON array -> newline-joined description string
UPDATE products SET
  tag = COALESCE(NULLIF(brand, ''), 'TEE'),
  condition = COALESCE(NULLIF(era, ''), 'Good'),
  description = COALESCE(
    CASE
      WHEN productId IS NOT NULL AND productId != '[]'
      THEN REPLACE(REPLACE(productId, '["', ''), '"]', '')
      ELSE ''
    END,
    ''
  );
```

### 2. `orders` table (`.wrangler/migrations/NNNN_create_orders.sql`)
```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  createdAt INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  customerName TEXT,
  customerPhone TEXT,
  customerInstagram TEXT,
  notes TEXT,
  pickup INTEGER DEFAULT 0,
  address TEXT,
  items TEXT NOT NULL,
  total INTEGER DEFAULT 0
);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_createdAt ON orders(createdAt);
```

### 3. `settings` table (`.wrangler/migrations/NNNN_create_settings.sql`)
```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
INSERT INTO settings (key, value) VALUES ('announcement', ''), ('whatsapp', '');
```

## Files to modify

### `src/lib/products.ts`
- Replace `Product` interface with canonical fields:
  - Add: `name`, `priceLabel`, `description`, `tag`, `condition`, `imageUrl`, `sortOrder`, `emoji`
  - Rename: `title` → `name`
  - Remove reliance on `brand`/`era`/`productId[]` in public type
- Add `Order` and `Setting` interfaces

### `src/lib/db.ts`
- `ProductRow`:
  - drop `brand`, `era`, `productId`
  - add `priceLabel`, `sortOrder`, `description`, `tag`, `condition`, `imageUrl`
- `rowToProduct` / `productToRow`:
  - map `tag`, `condition`, `description` (newline-join on write, split on read), `priceLabel`, `sortOrder`, `imageUrl`
  - note: `emoji` optional
- Add `OrderRow` interface
- Add `rowToOrder` / `orderToRow`

### `src/lib/products.server.ts`
- Drop `brand`/`era`/`productId` from queries, validators
- `buildWhere`: filter on `tag`, `condition`, `size`, `availability`, `q`
- Sort by `sortOrder` by default; fallback `createdAt DESC`
- `getDashboardStats`: return Pizza Steve cards:
  - `total`, `available`, `sold`, `oneLeft`, `revenue`, `avgOrderValue`
  - `avgOrderValue` = average `total` from completed orders
- Add `reorderProducts(orderedIds: string[])` - updates `sortOrder` sequentially
- Add `listTags()` and `listConditions()` for filter dropdowns

### `src/lib/orders.server.ts` (new)
- listOrders()
- getOrderById(id)
- updateOrderStatus(id, status)
- deleteOrder(id)
- getOrderStats() → pending, completed, cancelled counts + revenue

### `src/lib/functions/products.ts`
- Validators aligned to canonical schema:
  - `tag` required, enum Pizza Steve categories
  - `condition` required, enum Deadstock/Perfect/Good/Fair
  - `description` required string
  - `priceLabel` optional string
  - `sortOrder` optional number
  - `imageUrl` optional string
- Add server fns: `reorderProductsFn`, `getOrderStatsFn`

### `src/lib/functions/orders.ts` (new)
- `listOrdersFn`, `getOrderFn`, `updateOrderStatusFn`, `deleteOrderFn`

### `src/lib/functions/settings.ts` (new)
- `getSettingFn(key)`, `setSettingFn(key, value)`

### `src/lib/cloudinary.ts`
- Unchanged

### `src/routes/admin.tsx`
Full Pizza Steve UX clone, mapped to canonical fields. Keep current login/loader/auth hooks.

Layout/sections:
- **Header**: title, inline toast badge, logout
- **Stats row (4 cards)**: TOTAL, LIVE (available + one-left), SOLD, PENDING (clickable → orders tab)
- **Revenue row (2 cards)**: TOTAL REVENUE (completed orders), AVG ORDER (avg + completed count)
- **Pending callout**: if pending > 0 → click → orders tab
- **Tabs**: PRODUCTS | ORDERS | SETTINGS

Products tab:
  - **Add Product** panel — SINGLE ITEM / BULK DROP toggle
  - Single form: Name, Size, Price, Category (`tag` select from Pizza Steve list), Condition (`condition` select), Description (`description` textarea), main image + extra images
  - Bulk drop: same fields per row, row-level image slots, add/remove row
  - **Search** input (name/tag/size)
  - **Filter row**: Category, Size, Condition, Availability
  - **Toolbar**: Available count, Bulk sold button, Reorder toggle
    - Bulk sold: multi-select checkboxes → confirm
    - Reorder: drag rows → Save order button
  - **Available rows** (inline expand):
    - Collapsed: thumbnail, name, tag, size, price, condition badge, img count
    - Expanded: edit price, condition, description, save; Sold/Restore, Duplicate, Delete; image gallery with remove
  - **Sold section** at bottom (non-expandable, Restore/Delete only)

Orders tab:
  - Search input (name/phone/order ID)
  - Filter pills: All | Pending | Confirmed | Completed | Cancelled (with counts)
  - Sort select: Newest/Oldest, Total high→low/low→high
  - Order cards:
    - Header: ID, timestamp, status badge
    - Customer: name, phone (tel: link), Instagram, WhatsApp message link
    - Details: pickup vs delivery, notes
    - Reserved items list with prices
    - Total
    - Actions: Complete/Confirm/Cancel (pending only); Restore to Pending/Cancel (completed/confirmed); Restore to Pending (cancelled); Delete

Settings tab:
  - **Announcement Banner** input + Save / Clear
  - **WhatsApp Number** input + Save
  - **Danger Zone**: Clear all sold items

### `src/routes/shop.tsx`
- Filters vocab becomes:
  - Category: Pizza Steve fixed list, sourced from DB distinct `tag` values
  - Condition: Pizza Steve fixed list, sourced from DB distinct `condition` values
  - Size: dynamic from DB
  - Price: keep existing ranges
  - Availability: available | one-left | sold
- Filter UI order: Category, Condition, Size, Price, Availability toggle
- Sort: newest | featured | price-asc | price-desc

### `src/routes/index.tsx`
- Loader unchanged structurally; newPicks from D1 with canonical shape
- If CategoryTiles used, align to Pizza Steve category labels

### `src/routes/product.$id.tsx`
- Render `tag`, `condition`, `description` (newline bullets), `priceLabel` fallback
- Measurements removed from public display (internal only if needed)

### `src/components/CategoryTiles.tsx`
- Replace placeholder labels with Pizza Steve categories: TEE, JORTS, OUTERWEAR, DROP, SHIRT (or dynamic by count)

### `src/components/ProductCard.tsx`
- Show `tag` below name
- Show `priceLabel` if present, else numeric price
- Badge availability as Pizza Steve: "Sold out" / "1 left" / in-stock

### `src/components/ProductInfo.tsx`
- Show `tag`, `condition`
- Show `description` bullets (newline-split)
- Show `priceLabel` if present, else numeric price
- `size` section unchanged
- Measurements removed

### `src/lib/cart.tsx`
- Update `add()` to handle `priceLabel` override or keep numeric price as-is

## Server files summary

New:
- `src/lib/orders.server.ts`
- `src/lib/functions/orders.ts`
- `src/lib/functions/settings.ts`
- `.wrangler/migrations/NNNN_add_canonical_fields.sql`
- `.wrangler/migrations/NNNN_create_orders.sql`
- `.wrangler/migrations/NNNN_create_settings.sql`

Modified:
- `src/lib/products.ts`
- `src/lib/db.ts`
- `src/lib/products.server.ts`
- `src/lib/functions/products.ts`
- `src/routes/admin.tsx`
- `src/routes/shop.tsx`
- `src/components/ProductCard.tsx`
- `src/components/ProductInfo.tsx`
- `src/components/CategoryTiles.tsx`
- `src/lib/cart.tsx`

## Pre-migration checklist
1. Back up DB or confirm local wrangler dev is safe
2. Run `wrangler d1 migrations apply prelovedfinds-db --local`
3. Verify data migration: `SELECT id, brand, era, productId FROM products LIMIT 5` before and `SELECT id, tag, condition, description FROM products` after
4. Check `productId` JSON arrays correctly joined to newline strings

## Validation
1. `npm run build` succeeds
2. `/admin` renders, create product → DB row has `tag`, `condition`, `description`, `sortOrder`
3. `/shop` filter dropdowns show Pizza Steve categories + conditions
4. Product pages show `tag`, `condition`, bullet description
5. Orders created in admin round-trip; status updates persist
6. Settings save/reload

## Banked decisions
- `productId[]` is **removed** from the public and admin schema; only `description` string remains
- `brand` and `era` columns can remain in DB but are no longer read or written
- `priceLabel`: if set, show instead of numeric price; product card + admin row + edit modal
- `sortOrder`: integer; drag reorder writes sequential indices
- `emoji`: admin-only fallback, not rendered publicly
- No `availability` filter dropdown? Keep it — Pizza Steve has it implicitly via availability states. Preloved already has it.
- Orders are reservations only (no payment). Status flow: pending → confirmed → completed / cancelled.
