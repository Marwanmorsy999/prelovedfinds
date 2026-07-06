import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { products, type Product } from "@/lib/products";
import { ProductGrid } from "@/components/ProductGrid";
import { FilterDropdown } from "@/components/FilterDropdown";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop All — Preloved Finds" },
      { name: "description", content: "Browse every one-of-one vintage piece in stock at Preloved Finds." },
      { property: "og:title", content: "Shop All — Preloved Finds" },
      { property: "og:description", content: "Every one-of-one vintage piece in stock." },
    ],
  }),
  component: Shop,
});

const PER_PAGE = 8;

function Shop() {
  const [availability, setAvailability] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sort, setSort] = useState("featured");
  const [cols, setCols] = useState<3 | 4>(4);
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [availability, priceRange, sort]);

  const filtered = useMemo(() => {
    let list: Product[] = [...products];
    if (availability !== "all") list = list.filter((p) => p.availability === availability);
    if (priceRange === "under-700") list = list.filter((p) => p.price < 700);
    if (priceRange === "700-900") list = list.filter((p) => p.price >= 700 && p.price <= 900);
    if (priceRange === "over-900") list = list.filter((p) => p.price > 900);
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "newest") list.sort((a, b) => b.createdAt - a.createdAt);
    return list;
  }, [availability, priceRange, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <div className="border-b border-hairline pb-6">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-rust">Collection</p>
        <h1 className="mt-2 font-display text-4xl uppercase tracking-tight text-ink md:text-6xl">Shop All</h1>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <FilterDropdown
          label="Availability"
          value={availability}
          onChange={setAvailability}
          options={[
            { value: "all", label: "All" },
            { value: "available", label: "Available" },
            { value: "one-left", label: "1 Left" },
            { value: "sold", label: "Sold Out" },
          ]}
        />
        <FilterDropdown
          label="Price"
          value={priceRange}
          onChange={setPriceRange}
          options={[
            { value: "all", label: "All" },
            { value: "under-700", label: "Under 700" },
            { value: "700-900", label: "700–900" },
            { value: "over-900", label: "Over 900" },
          ]}
        />
        <FilterDropdown
          label="Sort"
          value={sort}
          onChange={setSort}
          options={[
            { value: "featured", label: "Featured" },
            { value: "price-asc", label: "Price low–high" },
            { value: "price-desc", label: "Price high–low" },
            { value: "newest", label: "Newest" },
          ]}
        />

        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-grey">{filtered.length} items</p>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-grey">View</span>
          {[3, 4].map((c) => (
            <button
              key={c}
              onClick={() => setCols(c as 3 | 4)}
              className={`border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] ${cols === c ? "border-rust text-rust" : "border-hairline text-grey"}`}
            >
              {c} cols
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10">
        {paged.length ? (
          <ProductGrid products={paged} cols={cols} />
        ) : (
          <div className="flex flex-col items-center justify-center border border-hairline bg-surface py-24 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-grey">No matches</p>
            <p className="mt-3 max-w-sm text-sm text-ink">No pieces match your current filters. Try widening your search.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <nav className="mt-16 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`h-10 w-10 border text-xs font-semibold ${n === currentPage ? "border-rust bg-rust text-paper" : "border-hairline text-ink hover:border-rust hover:text-rust"}`}
            >
              {n}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
