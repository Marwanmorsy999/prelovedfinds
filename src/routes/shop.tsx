import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { listProductsFn } from "@/lib/functions/products";

// These match the admin categories exactly
const CATEGORIES = ["TEE", "SHIRT", "JEANS", "PANTS", "SHORTS", "OTHER"];

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop All - Preloved Finds" },
      { name: "description", content: "Browse every one-of-one vintage piece in stock at Preloved Finds." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    category: typeof search.category === "string" ? search.category : "all",
    availability: typeof search.availability === "string" ? search.availability : "all",
    sort: typeof search.sort === "string" ? search.sort : "newest",
    page: typeof search.page === "number" ? search.page : 1,
  }),
  loader: async ({ location }) => {
    const search = location.search as { category: string; availability: string; sort: string; page: number };
    return listProductsFn({
      data: {
        availability: search.availability as never,
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
  const currentPage = Math.min(page, totalPages || 1);
  const [searchQuery, setSearchQuery] = useState("");
  const [gridCols, setGridCols] = useState<2 | 4>(4);

  const updateSearch = (patch: Record<string, unknown>) =>
    navigate({ to: "/shop", search: { ...search, ...patch } as typeof search });

  // Filter by category (brand field) and search query client-side
  const filtered = useMemo(() => {
    let result = items;
    if (search.category !== "all") {
      result = result.filter((p) => p.brand.toUpperCase() === search.category);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.title.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.era.toLowerCase().includes(q),
      );
    }
    return result;
  }, [items, search.category, searchQuery]);

  const hasMore = currentPage < totalPages;
  const hasActiveFilters = search.category !== "all" || search.availability !== "all";

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="border-b border-[#e5e7eb] px-4 py-7 md:px-8">
        <div className="mx-auto max-w-7xl flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#9ca3af] mb-1">Collections</p>
            <h1 className="text-[26px] font-bold uppercase tracking-widest text-[#1a1a1a]">
              {search.category !== "all" ? search.category : "Shop All"}
            </h1>
          </div>
          <p className="text-[12px] text-[#9ca3af] mb-1">{total} items</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => updateSearch({ category: "all", page: 1 })}
            className={`h-9 px-4 text-[11px] font-bold uppercase tracking-widest border transition-colors duration-150 ${
              search.category === "all"
                ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                : "bg-white text-[#6b7280] border-[#e5e7eb] hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => updateSearch({ category: cat, page: 1 })}
              className={`h-9 px-4 text-[11px] font-bold uppercase tracking-widest border transition-colors duration-150 ${
                search.category === cat
                  ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                  : "bg-white text-[#6b7280] border-[#e5e7eb] hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="h-10 w-full border border-[#e5e7eb] bg-white pl-9 pr-8 text-[13px] text-[#1a1a1a] outline-none focus:border-[#1a1a1a] transition-colors placeholder:text-[#9ca3af]"
              aria-label="Search products"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#1a1a1a]">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Availability */}
          <div className="relative">
            <select
              value={search.availability}
              onChange={(e) => updateSearch({ availability: e.target.value, page: 1 })}
              className="h-10 appearance-none border border-[#e5e7eb] bg-white pl-3 pr-8 text-[12px] font-semibold uppercase tracking-widest text-[#1a1a1a] outline-none hover:border-[#1a1a1a] transition-colors cursor-pointer"
            >
              <option value="all">All</option>
              <option value="available">In Stock</option>
              <option value="one-left">1 Left</option>
              <option value="sold">Sold</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6b7280]" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={search.sort}
              onChange={(e) => updateSearch({ sort: e.target.value, page: 1 })}
              className="h-10 appearance-none border border-[#e5e7eb] bg-white pl-3 pr-8 text-[12px] font-semibold uppercase tracking-widest text-[#1a1a1a] outline-none hover:border-[#1a1a1a] transition-colors cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low–High</option>
              <option value="price-desc">Price: High–Low</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6b7280]" />
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={() => updateSearch({ category: "all", availability: "all", page: 1 })}
              className="flex items-center gap-1.5 h-10 px-3 text-[11px] font-semibold uppercase tracking-widest text-[#1a1a1a] border border-[#e5e7eb] hover:border-[#1a1a1a] transition-colors"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}

          {/* Grid toggle */}
          <div className="flex gap-1 ml-auto">
            {([2, 4] as const).map((n) => (
              <button
                key={n}
                onClick={() => setGridCols(n)}
                className={`h-9 w-9 flex items-center justify-center border transition-colors ${
                  gridCols === n ? "border-[#1a1a1a] bg-[#1a1a1a] text-white" : "border-[#e5e7eb] text-[#6b7280] hover:border-[#1a1a1a]"
                }`}
                aria-label={`${n} columns`}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor">
                  {n === 2 ? (
                    <><rect x="0" y="0" width="5.5" height="13" /><rect x="7.5" y="0" width="5.5" height="13" /></>
                  ) : (
                    <><rect x="0" y="0" width="2.5" height="5.5" /><rect x="3.5" y="0" width="2.5" height="5.5" /><rect x="7" y="0" width="2.5" height="5.5" /><rect x="10.5" y="0" width="2.5" height="5.5" /><rect x="0" y="7.5" width="2.5" height="5.5" /><rect x="3.5" y="7.5" width="2.5" height="5.5" /><rect x="7" y="7.5" width="2.5" height="5.5" /><rect x="10.5" y="7.5" width="2.5" height="5.5" /></>
                  )}
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Product grid */}
        {filtered.length ? (
          <div className={`grid gap-4 md:gap-5 ${gridCols === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"}`}>
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-[22px] font-bold text-[#1a1a1a] mb-2">No pieces found</p>
            <p className="text-[13px] text-[#9ca3af] mb-6">Try a different category or clear your filters</p>
            <button
              onClick={() => { setSearchQuery(""); updateSearch({ category: "all", availability: "all", sort: "newest", page: 1 }); }}
               className="h-11 bg-[#1a1a1a] text-white px-8 text-[12px] font-bold uppercase tracking-widest hover:bg-[#6b7280] transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Load more */}
        {hasMore && !searchQuery && (
          <div className="mt-14 text-center">
            <button
              onClick={() => updateSearch({ page: currentPage + 1 })}
              className="h-11 border border-[#1a1a1a] px-10 text-[12px] font-bold uppercase tracking-widest text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-colors"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
