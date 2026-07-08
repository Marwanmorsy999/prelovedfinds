import type { ProductInput, ListParams } from "@/lib/products.server";
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
  getDashboardStats,
  searchProducts,
  getDistinctTags,
  getDistinctSizes,
  getDistinctConditions,
  reorderProducts,
} from "@/lib/products.server";
import { requireAdmin } from "@/lib/auth";

const availabilityEnum = z.enum(["available", "one-left", "sold"]);

const productInputSchema = z.object({
  id: z.string().min(1).max(120),
  title: z.string().min(1).max(200),
  price: z.number().int().nonnegative(),
  priceLabel: z.string().max(120).optional(),
  availability: availabilityEnum,
  tag: z.string(),
  condition: z.string(),
  description: z.string().max(2000).default(""),
  size: z.string().min(1).max(40),
  imageUrl: z.string().url().optional().nullable().default(null),
  images: z.array(z.string().url()).optional().default([]),
  sortOrder: z.number().int().nonnegative().optional(),
  brand: z.string().optional(),
  era: z.string().optional(),
  currency: z.string().optional(),
  productId: z.array(z.string()).optional(),
  measurements: z.array(z.string()).optional(),
});

const listParamsSchema = z.object({
  tag: z.string().optional(),
  size: z.string().optional(),
  condition: z.string().optional(),
  availability: availabilityEnum.or(z.literal("all")).optional(),
  priceRange: z.enum(["all", "under-700", "700-900", "over-900"]).optional(),
  sort: z.enum(["newest", "featured", "price-asc", "price-desc"]).optional(),
  page: z.number().int().positive().optional(),
  perPage: z.number().int().positive().optional(),
  q: z.string().optional(),
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
  .validator(z.object({ id: z.string(), patch: z.any() }))
  .handler(async ({ data }) => {
    await requireAdmin();
    return updateProduct(data.id, data.patch as Partial<ProductInput>);
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

export const toggleSoldFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await requireAdmin();
    const product = await getProductById(data.id);
    if (!product) throw new Error("Product not found");
    const next = product.availability === "sold" ? "available" : "sold";
    return updateProduct(data.id, { availability: next });
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

export const getDistinctTagsFn = createServerFn({ method: "GET" }).handler(async () => {
  return getDistinctTags();
});

export const getDistinctSizesFn = createServerFn({ method: "GET" }).handler(async () => {
  return getDistinctSizes();
});

export const getDistinctConditionsFn = createServerFn({ method: "GET" }).handler(async () => {
  return getDistinctConditions();
});
