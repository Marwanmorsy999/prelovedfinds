import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listCategoriesFn } from "@/lib/functions/categories";
import type { Category } from "@/lib/categories.server";

export function CategoryTiles() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    listCategoriesFn().then(setCategories).catch(() => {});
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
      <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
        {categories.slice(0, 5).map((cat) => (
          <Link
            key={cat.name}
            to="/shop"
            search={{ tag: cat.name.toLowerCase(), size: "all", condition: "all", priceRange: "all", sort: "newest", q: "", page: 1 }}
            className="group relative flex aspect-[3/2] flex-col items-start justify-end overflow-hidden bg-surface"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative z-10 p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-paper/70">
                {cat.label}
              </p>
              <h3 className="mt-1 font-display text-2xl font-bold uppercase tracking-tight text-paper">
                {cat.label}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}