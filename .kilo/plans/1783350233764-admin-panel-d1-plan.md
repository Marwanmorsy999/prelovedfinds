# Preloved Finds — Admin Panel (Cloudflare D1 + TanStack Start + Cloudinary)

## Goal

Add a protected admin panel at `/admin` (login `/admin/login`) that manages the vintage
product catalog in a **Cloudflare D1** SQLite database, replacing the current hardcoded
`src/lib/products.ts` array. Mirror the "Mr. Pizza Steve Finds" pattern: session-token auth
(sourced from an env secret, not a hardcoded password), dashboard stats, filter/sort/
pagination, revenue cards, and an amber "Mark Sold" button. Product images are uploaded to
**Cloudinary** (unsigned preset) and the returned URLs are stored in D1.

## Confirmed decisions (from codebase inspection + user)

- **Build target**: Cloudflare Workers (`nitro.preset: "cloudflare-module"` in `vite.config.ts`).
  Filesystem writes do NOT persist on Workers → **D1** is the store (approved).
- **D1 access**: inside TanStack server functions, binding is at `globalThis.__env__.DB`
  (set by Nitro v3 cloudflare preset) and `getRequest().runtime?.cloudflare?.env?.DB`.
  Encapsulate behind `getDB()`.
- **Auth**: env secret `ADMIN_PASSWORD` (approved); HMAC-signed session cookie using
  `SESSION_SECRET`. No new deps (`crypto.subtle` HMAC-SHA256 + `crypto.randomUUID()`, both
  available under `nodejs_compat`).
- **Images**: **Cloudinary unsigned upload** (approved). Env: `CLOUDINARY_CLOUD_NAME`,
  `CLOUDINARY_UNSIGNED_PRESET`. Browser uploads directly to Cloudinary; returned secure URLs
  are stored in D1 `images` (JSON array). No `CLOUDINARY_API_SECRET` needed.
- Required shadcn components already exist under `src/components/ui/`
  (table, card, button, input, dialog, badge, select, pagination, label, textarea, sonner,
  switch, alert-dialog, skeleton).
- Server fns: `createServerFn` from `@tanstack/react-start`.
  Cookies: `getCookie`/`setCookie`/`deleteCookie` from `@tanstack/start-server-core`.
- Root uses `createRootRouteWithContext<{ queryClient: QueryClient }>()` → thread `admin: boolean`
  into router context for clean guard + nav visibility.

## Data model (D1)

Table `products` (mirrors current `Product` type in `src/lib/products.ts`):

| col          | type    | notes                                                         |
| ------------ | ------- | ------------------------------------------------------------- |
| id           | TEXT PK | slug, e.g. `levis-501-black` (admin supplies; must be unique) |
| title        | TEXT    |                                                               |
| brand        | TEXT    |                                                               |
| era          | TEXT    |                                                               |
| price        | INTEGER | EGP, integer                                                  |
| currency     | TEXT    | default `'EGP'`                                               |
| availability | TEXT    | `'available'` \| `'one-left'` \| `'sold'`                     |
| size         | TEXT    |                                                               |
| images       | TEXT    | JSON array string of Cloudinary URLs                          |
| productId    | TEXT    | JSON array string (bullet copy)                               |
| measurements | TEXT    | JSON array string                                             |
| createdAt    | INTEGER | epoch ms                                                      |

Seed from the existing 12 products in `src/lib/products.ts` (images carry their current
`/assets/*.jpeg` public URLs or left empty) so the live site is unchanged after migration.

## Files to create

1. `wrangler.jsonc` — **add** `[[d1_databases]]` binding `DB` (name `prelovedfinds-db`,
   `database_id` placeholder, `migrations_dir = ".wrangler/migrations"`). Keep existing `main`,
   `assets`, `nodejs_compat`, `observability`. Add vars (non-secret) `CLOUDINARY_CLOUD_NAME`,
   `CLOUDINARY_UNSIGNED_PRESET` under `vars` (or keep them as secrets — operator choice; they
   are not sensitive, so `vars` is fine and simplifies local dev).
2. `migrations/0001_init.sql` — `CREATE TABLE products (...)` + seed `INSERT` for the 12
   existing products (arrays JSON-stringified).
3. `src/lib/db.ts` — `getDB()` → `globalThis.__env__.DB as D1Database` (cast defensively;
   for local `wrangler dev`, `globalThis.__env__` is populated by Nitro). `ProductRow` type +
   `rowToProduct` / `productToRow` mappers (JSON parse/stringify for the 3 array cols).
4. `src/lib/env.ts` — `getEnv()` reads from `globalThis.__env__` with `process.env` fallback
   (for `vite dev`/Node). Exposes `ADMIN_PASSWORD`, `SESSION_SECRET`, `CLOUDINARY_CLOUD_NAME`,
   `CLOUDINARY_UNSIGNED_PRESET`.
5. `src/lib/auth.ts` — `signSessionToken()` (HMAC-SHA256 over `v1.<random>`),
   `verifySessionToken()` (constant-time compare), `issueSession()`/`clearSession()` via
   `setCookie`/`deleteCookie`, `requireAdmin()` (reads `getCookie('session')`, verifies; throws
   a 401-style error if invalid), `getIsAuthed()` (boolean, for router context).
6. `src/lib/products.server.ts` — D1 data access used by server fns + loaders:
   `listProducts({availability?, sort?, page?, perPage?})` (returns `{items, total}`),
   `getProductById(id)`, `getRelated(id, n)`, `createProduct(input)`, `updateProduct(id, patch)`,
   `deleteProduct(id)`, `toggleSold(id)` (sold ⇄ available), `getDashboardStats()`
   (total, available, sold, one-left, revenue = Σ price where sold).
7. `src/server/functions/products.ts` — `createServerFn` exports: `listProductsFn`, `getProductFn`,
   `getRelatedFn`, `createProductFn`, `updateProductFn`, `deleteProductFn`, `toggleSoldFn`,
   `dashboardStatsFn`. Each **mutating** fn calls `requireAdmin()` first. Inputs validated with
   `zod` (price int, availability enum, arrays as string[]).
8. `src/server/functions/auth.ts` — `loginFn({password})` (constant-time compare to
   `ADMIN_PASSWORD`, issue session cookie, return `{ok:true}`), `logoutFn()` (clear cookie).
9. `src/lib/cloudinary.ts` — client helper `uploadToCloudinary(file: File): Promise<string>` using
   `fetch` to `https://api.cloudinary.com/v1_1/<CLOUDINARY_CLOUD_NAME>/image/upload` with form
   data `{ file, upload_preset: CLOUDINARY_UNSIGNED_PRESET }`, returns `secure_url`.
   Config (cloud name + preset) passed from a tiny `getCloudinaryConfigFn` server fn or read from
   `getEnv()` in the client (they are non-sensitive `vars`).
10. Routes:

- `src/routes/admin.login.tsx` — password form → `loginFn` → redirect `/admin`; error via `sonner`.
- `src/routes/admin.tsx` — protected dashboard:
  - Guard via router context `admin` (set in root `beforeLoad`); if false → `<Navigate to="/admin/login">`.
  - Revenue cards + stats from `dashboardStatsFn`.
  - `Table` (image thumb, title, brand, price, availability `Badge`, actions: Edit dialog,
    amber **Mark Sold/Available** `Button`, Delete `AlertDialog`).
  - Filter (availability) + sort + **pagination** (server-side, `PER_PAGE = 8`) reusing shop's
    filter vocabulary.
  - "Add Product" → create dialog. Edit/Create dialogs use `Input`/`Textarea`/`Select`/`Label`;
    `productId`/`measurements` edited as newline-separated `Textarea` (joined on save);
    **images** handled by Cloudinary upload (multiple files → URL list shown as thumbnails,
    removable). `sonner` toasts on success/error.
- Logout: button in `/admin` header calling `logoutFn` → redirect `/admin/login`.

## Files to modify

- `src/lib/products.ts` — keep `Product` + `Availability` types (shared by UI); **delete** the
  hardcoded `products` array + `getProduct`/`getRelated` so the app can't import stale data.
  (Loaders now use server fns.)
- `src/routes/index.tsx` — replace `products.slice(0,4)` with a loader calling
  `listProductsFn({sort:'newest', perPage:4})`.
- `src/routes/shop.tsx` — replace client-side `import { products }` + in-memory filter with a
  loader/route that reads filter/sort/page from **search params** and calls
  `listProductsFn({availability, sort, page, perPage:8})`. Pagination now server-side; total pages
  from `total`. Keep the existing filter UI vocabulary.
- `src/routes/product.$id.tsx` — replace `getProduct`/`getRelated` with loaders calling
  `getProductFn(id)` / `getRelatedFn(id)`; keep `notFound()` behavior.
- `src/routes/__root.tsx`:
  - Add `<Toaster />` (from `@/components/ui/sonner`) inside `RootComponent` — **currently missing**,
    required for all `sonner` usage in the plan.
  - Add `beforeLoad` to root route that sets `admin: getIsAuthed()` into router context
    (so `/admin` guard + nav link visibility are clean).
  - Add an "Admin" nav/footer link (visible when `admin` context true, or always → redirects to
    login if not authed).
- `src/components/Navigation.tsx` / `Footer.tsx` — surface the admin link based on `admin` context
  (`Route.useRouteContext()`), if not already wired.
- `vite.config.ts` — no change for D1. Confirm `cloudflare.nodeCompat: true` stays.
- `package.json` — add optional scripts: `db:migrate:local`, `db:migrate:remote`,
  `db:create` (wrangler d1 …).

## Auth flow detail

- `loginFn({password})` → constant-time compare to `ADMIN_PASSWORD`; if ok, `setCookie('session',
signSessionToken(), { httpOnly:true, sameSite:'lax', path:'/', maxAge: 60*60*24*7 })` → `{ok:true}`.
- Root `beforeLoad` → `admin = getIsAuthed()` (reads `getCookie('session')`, `verifySessionToken`).
- `/admin` `beforeLoad`/component → if `!admin`, `<Navigate to="/admin/login">`.
- Mutating server fns → `requireAdmin()` first; invalid → throws (mapped to 401 / redirect to login).
- `logoutFn` → `deleteCookie('session')`.

## Local dev + deployment notes

- **Local dev**: use `wrangler dev` (not plain `vite dev`) so D1 + bindings + Cloudinary `vars`
  are present. Run `wrangler d1 migrations apply prelovedfinds-db --local` once. `getEnv()` falls
  back to `process.env` for `vite dev` convenience.
- **Prod**: `wrangler d1 create prelovedfinds-db` → set `database_id` in `wrangler.jsonc` →
  `wrangler d1 migrations apply prelovedfinds-db --remote` → `wrangler secret put ADMIN_PASSWORD`
  and `wrangler secret put SESSION_SECRET` (Cloudinary name/preset can be `vars` or secrets) →
  `npm run build && wrangler deploy`.
- `nodejs_compat` enabled ⇒ `crypto.subtle` + `crypto.randomUUID` available.

## Risks / open questions

- `database_id` is env-specific — placeholder; operator fills + runs create/migrate before deploy.
- `getRequest().runtime.cloudflare.env` typing is loose; `getDB()` casts defensively.
- Plain `vite dev` lacks D1/Cloudinary env — admin flow must run via `wrangler dev`. Documented.
- Stateless token: rotating `SESSION_SECRET` invalidates all sessions. Acceptable for scope.
- Cloudinary unsigned preset must be scoped (e.g. folder restriction) to avoid abuse; operator
  configures the preset in the Cloudinary dashboard.
- Migrating existing `/assets/*.jpeg` product photos: either re-upload to Cloudinary or keep the
  static `/assets` URLs (they remain served from the Workers `assets` bucket). Default: keep
  existing static URLs; new uploads go to Cloudinary.

## Validation

1. `npm run build` succeeds (`cloudflare-module`).
2. `wrangler dev` → `/admin/login`: wrong password rejected; correct password → cookie → `/admin`.
3. `/admin` dashboard: stats correct (12 seeded; revenue = Σ sold prices); toggle Sold flips
   availability + updates revenue; create/edit/delete persist and reflect on `/shop` and `/` after
   reload; filter/sort/pagination work; Cloudinary image upload returns a URL stored in D1 and
   shown on the product.
4. `/shop`, `/`, `/product/$id` render from D1 (no hardcoded data).
5. Unauthed `/admin` → redirect to `/admin/login`; mutating server fn without session → 401.
6. `wrangler deploy --dry-run` bundles successfully.
