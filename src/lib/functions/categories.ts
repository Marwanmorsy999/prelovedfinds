import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  listCategories,
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/categories.server";
import { requireAdmin } from "@/lib/auth";

export const listCategoriesFn = createServerFn({ method: "GET" }).handler(async () => {
  return listCategories();
});

export const createCategoryFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      name: z.string().min(1).max(60),
      label: z.string().min(1).max(60),
    }),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    return createCategory(data.name, data.label);
  });

export const deleteCategoryFn = createServerFn({ method: "POST" })
  .validator(z.object({ name: z.string().min(1) }))
  .handler(async ({ data }) => {
    await requireAdmin();
    return deleteCategory(data.name);
  });

export const updateCategoryFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      name: z.string().min(1),
      patch: z.object({
        name: z.string().min(1).max(60).optional(),
        label: z.string().min(1).max(60).optional(),
      }),
    }),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    return updateCategory(data.name, data.patch);
  });
