import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  listProducts,
  getProductById,
  getRelated,
  createProduct,
  createProducts,
  updateProduct,
  deleteProduct,
  deleteSoldProducts,
  toggleSold,
  getDashboardStats,
  searchProducts,
  type ProductInput,
  type ListParams,
} from "@/lib/products.server";
import { requireAdmin } from "@/lib/auth";

const availabilityEnum = z.enum(["available", "one-left", "sold"]);

const productInputSchema = z.object({
  id: z.string().min(1).max(120),
  title: z.string().min(1).max(200),
  brand: z.string().min(1).max(120),
  era: z.string().min(1).max(120),
  price: z.number().int().positive(),
  currency: z.literal("EGP").optional(),
  availability: availabilityEnum,
  size: z.string().min(1).max(40),
  images: z.array(z.string()).optional(),
  productId: z.array(z.string()).optional(),
  measurements: z.array(z.string()).optional(),
});

const listParamsSchema = z.object({
  availability: availabilityEnum.or(z.literal("all")).optional(),
  priceRange: z.enum(["all", "under-700", "700-900", "over-900"]).optional(),
  sort: z.enum(["featured", "price-asc", "price-desc", "newest"]).optional(),
  page: z.number().int().positive().optional(),
  perPage: z.number().int().positive().optional(),
});

export const listProductsFn = createServerFn({ method: "GET" })
  .validator(listParamsSchema.optional())
  .handler(async ({ data }) => listProducts((data ?? {}) as ListParams));

export const getProductFn = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => getProductById(data.id));

export const getRelatedFn = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string(), n: z.number().int().positive().optional() }))
  .handler(async ({ data }) => getRelated(data.id, data.n ?? 4));

export const createProductFn = createServerFn({ method: "POST" })
  .validator(productInputSchema)
  .handler(async ({ data }) => {
    await requireAdmin();
    return createProduct(data as ProductInput);
  });

export const updateProductFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), patch: productInputSchema.partial().omit({ id: true }) }))
  .handler(async ({ data }) => {
    await requireAdmin();
    return updateProduct(data.id, data.patch);
  });

export const createProductsBulkFn = createServerFn({ method: "POST" })
  .validator(z.object({ items: z.array(productInputSchema).min(1).max(50) }))
  .handler(async ({ data }) => {
    await requireAdmin();
    return createProducts(data.items as ProductInput[]);
  });

export const deleteProductFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await requireAdmin();
    return deleteProduct(data.id);
  });

export const deleteSoldProductsFn = createServerFn({ method: "POST" }).handler(async () => {
  await requireAdmin();
  return deleteSoldProducts();
});

export const toggleSoldFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await requireAdmin();
    return toggleSold(data.id);
  });

export const dashboardStatsFn = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  return getDashboardStats();
});

export const searchProductsFn = createServerFn({ method: "GET" })
  .validator(z.object({ query: z.string().min(1).max(100) }))
  .handler(async ({ data }) => {
    await requireAdmin();
    return searchProducts(data.query);
  });
