import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { listProductsFn } from "@/lib/functions/products";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop All - Preloved Finds" },
      {
        name: "description",
        content: "Browse every one-of-one vintage piece in stock at Preloved Finds.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    availability: typeof search.availability === "string" ? search.availability : "all",
    priceRange: typeof search.priceRange === "string" ? search.priceRange : "all",
    sort: typeof search.sort === "string" ? search.sort : "featured",
    page: typeof search.page === "number" ? search.page : 1,
  }),
  loader: async ({ location }) => {
    const search = location.search as {
      availability: string;
      priceRange: string;
      sort: string;
      page: number;
    };
    return listProductsFn({
      data: {
        availability: search.availability as never,
        priceRange: search.priceRange as never,
        sort: search.sort as never,
        page: search.page,
        perPage: 16,
      },
    });
  },
  component: Shop,
});

function Shop() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { items, total, totalPages, page } = Route.useLoaderData();
  const [availability, priceRange, sort] = [search.availability, search.priceRange, search.sort];
  const currentPage = Math.min(page, totalPages || 1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [gridCols, setGridCols] = useState<2 | 4>(4);

  const updateSearch = (patch: Record<string, unknown>) => {
    navigate({ to: "/shop", search: { ...search, ...patch } as typeof search });
  };

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.era.toLowerCase().includes(q),
    );
  }, [items, searchQuery]);

  const hasMore = currentPage < totalPages;

  return (
    <div className="page-enter">
      {/* Page header */}
      <div className="border-b border-[#e5e7eb] px-4 py-8 md:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#9ca3af] mb-1">Collections</p>
          <h1 className="text-[28px] font-bold uppercase tracking-widest text-[#1a1a1a]">
            Shop All
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="h-10 w-full border border-[#e5e7eb] bg-white pl-9 pr-3 text-[13px] text-[#1a1a1a] outline-none focus:border-[#1a1a1a] transition-colors placeholder:text-[#9ca3af]"
              aria-label="Search products"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex h-10 items-center gap-2 border border-[#e5e7eb] bg-white px-4 text-[12px] font-semibold uppercase tracking-widest text-[#1a1a1a] hover:border-[#1a1a1a] transition-colors"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filter
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${filterOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Sort */}
          <div className="relative flex items-center">
            <select
              value={sort}
              onChange={(e) => updateSearch({ sort: e.target.value, page: 1 })}
              className="h-10 appearance-none border border-[#e5e7eb] bg-white pl-4 pr-8 text-[12px] font-semibold uppercase tracking-widest text-[#1a1a1a] outline-none hover:border-[#1a1a1a] transition-colors cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low–High</option>
              <option value="price-desc">Price: High–Low</option>
              <option value="newest">Newest</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-[#6b7280]" />
          </div>

          {/* Item count */}
          <p className="text-[12px] text-[#9ca3af] ml-auto">
            {total} {total === 1 ? "item" : "items"}
          </p>

          {/* Grid toggle */}
          <div className="flex gap-1">
            {([2, 4] as const).map((n) => (
              <button
                key={n}
                onClick={() => setGridCols(n)}
                className={`h-9 w-9 flex items-center justify-center border transition-colors ${
                  gridCols === n
                    ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                    : "border-[#e5e7eb] text-[#6b7280] hover:border-[#1a1a1a]"
                }`}
                aria-label={`${n} column grid`}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  {n === 2 ? (
                    <>
                      <rect x="0" y="0" width="6" height="14" rx="0.5" />
                      <rect x="8" y="0" width="6" height="14" rx="0.5" />
                    </>
                  ) : (
                    <>
                      <rect x="0" y="0" width="3" height="6" rx="0.5" />
                      <rect x="4" y="0" width="3" height="6" rx="0.5" />
                      <rect x="8" y="0" width="3" height="6" rx="0.5" />
                      <rect x="12" y="0" width="2" height="6" rx="0.5" />
                      <rect x="0" y="8" width="3" height="6" rx="0.5" />
                      <rect x="4" y="8" width="3" height="6" rx="0.5" />
                      <rect x="8" y="8" width="3" height="6" rx="0.5" />
                      <rect x="12" y="8" width="2" height="6" rx="0.5" />
                    </>
                  )}
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Filter panel */}
        {filterOpen && (
          <div className="mb-6 border border-[#e5e7eb] bg-[#f9fafb] p-6">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {/* Availability */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b7280] mb-3">
                  Availability
                </p>
                <div className="space-y-2">
                  {[
                    { value: "all", label: "All" },
                    { value: "available", label: "In stock" },
                    { value: "one-left", label: "1 Left" },
                    { value: "sold", label: "Sold out" },
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="availability"
                        checked={availability === opt.value}
                        onChange={() => updateSearch({ availability: opt.value, page: 1 })}
                        className="accent-[#1a1a1a]"
                      />
                      <span className="text-[13px] text-[#1a1a1a]">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b7280] mb-3">
                  Price
                </p>
                <div className="space-y-2">
                  {[
                    { value: "all", label: "All prices" },
                    { value: "under-700", label: "Under LE 700" },
                    { value: "700-900", label: "LE 700–900" },
                    { value: "over-900", label: "Over LE 900" },
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="price"
                        checked={priceRange === opt.value}
                        onChange={() => updateSearch({ priceRange: opt.value, page: 1 })}
                        className="accent-[#1a1a1a]"
                      />
                      <span className="text-[13px] text-[#1a1a1a]">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setFilterOpen(false)}
                className="h-10 bg-[#1a1a1a] text-white px-6 text-[12px] font-semibold uppercase tracking-widest hover:bg-black transition-colors"
              >
                Apply
              </button>
              <button
                onClick={() => {
                  updateSearch({ availability: "all", priceRange: "all", page: 1 });
                  setFilterOpen(false);
                }}
                className="h-10 border border-[#e5e7eb] px-6 text-[12px] font-semibold uppercase tracking-widest text-[#1a1a1a] hover:border-[#1a1a1a] transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* Product grid */}
        {filtered.length ? (
          <div className={`grid gap-4 ${gridCols === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"}`}>
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-[13px] text-[#6b7280] mb-4">No products found</p>
            <button
              onClick={() => {
                setSearchQuery("");
                updateSearch({ availability: "all", priceRange: "all", sort: "featured", page: 1 });
              }}
              className="h-10 border border-[#1a1a1a] px-6 text-[12px] font-semibold uppercase tracking-widest text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {hasMore && !searchQuery && (
          <div className="mt-14 text-center">
            <button
              onClick={() => updateSearch({ page: currentPage + 1 })}
              className="h-11 border border-[#1a1a1a] px-10 text-[12px] font-semibold uppercase tracking-widest text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-colors"
            >
              Load more
            </button>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-4 text-center">
            <a
              href="/shop"
              className="text-[11px] uppercase tracking-widest text-[#9ca3af] hover:text-[#6b7280] transition-colors"
            >
              Clear filters
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
