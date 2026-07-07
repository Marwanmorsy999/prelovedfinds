import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import {
  listProductsFn,
  getDistinctBrandsFn,
  getDistinctSizesFn,
  getDistinctErasFn,
} from "@/lib/functions/products";

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
    brand: typeof search.brand === "string" ? search.brand : "all",
    size: typeof search.size === "string" ? search.size : "all",
    era: typeof search.era === "string" ? search.era : "all",
    priceRange: typeof search.priceRange === "string" ? search.priceRange : "all",
    availability: typeof search.availability === "string" ? search.availability : "all",
    sort: typeof search.sort === "string" ? search.sort : "newest",
    q: typeof search.q === "string" ? search.q : "",
    page: typeof search.page === "number" ? search.page : 1,
  }),
  loader: async ({ location }) => {
    const search = location.search as {
      brand?: string;
      size?: string;
      era?: string;
      priceRange?: string;
      availability?: string;
      sort?: string;
      q?: string;
      page?: number;
    };
    return {
      products: listProductsFn({
        data: {
          brand: search.brand === "all" ? undefined : search.brand,
          size: search.size === "all" ? undefined : search.size,
          era: search.era === "all" ? undefined : search.era,
          priceRange: search.priceRange === "all" ? undefined : (search.priceRange as never),
          availability: search.availability as never,
          sort: search.sort as never,
          page: search.page,
          perPage: 16,
          q: search.q,
        },
      }),
      categories: getDistinctBrandsFn(),
      sizes: getDistinctSizesFn(),
      conditions: getDistinctErasFn(),
    };
  },
  component: Shop,
});

function Shop() {
  const navigate = useNavigate();
  const search = Route.useSearch();
const loader = Route.useLoaderData();
  const { items, total, totalPages, page } = loader.products;
  const initialCategories = Array.isArray(loader.categories) ? loader.categories : [];
  const initialSizes = Array.isArray(loader.sizes) ? loader.sizes : [];
  const initialConditions = Array.isArray(loader.conditions) ? loader.conditions : [];
  const [categories] = useState<string[]>(initialCategories);
  const [sizes] = useState<string[]>(initialSizes);
  const [conditions, setConditions] = useState<string[]>(initialConditions);
  const [filterOpen, setFilterOpen] = useState(false);
  const [query, setQuery] = useState(search.q || "");

  useEffect(() => {
    setConditions(initialConditions);
  }, [initialConditions]);

  const currentPage = Math.min(page, totalPages || 1);
  const [gridCols, setGridCols] = useState<2 | 4>(4);

  const updateSearch = (patch: Record<string, unknown>) =>
    navigate({ to: "/shop", search: { ...search, ...patch } as typeof search });

  const hasMore = currentPage < totalPages;
  const hasActiveFilters =
    search.brand !== "all" ||
    search.size !== "all" ||
    search.era !== "all" ||
    search.priceRange !== "all" ||
    search.availability !== "all";

  return (
    <div className="page-enter">
      <div className="border-b border-[#e5e7eb] px-4 py-7 md:px-8">
        <div className="mx-auto max-w-7xl flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#9ca3af] mb-1">
              Collections
            </p>
            <h1 className="text-[26px] font-bold uppercase tracking-widest text-[#1a1a1a]">
              {search.brand !== "all" ? search.brand : "Shop All"}
            </h1>
          </div>
          <p className="text-[12px] text-[#9ca3af] mb-1">{total} items</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") updateSearch({ q: query, page: 1 });
              }}
              placeholder="Search title, brand, size..."
              className="h-10 w-full border border-[#e5e7eb] bg-white pl-9 pr-8 text-[13px] text-[#1a1a1a] outline-none focus:border-[#1a1a1a] transition-colors placeholder:text-[#9ca3af]"
              aria-label="Search products"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  updateSearch({ q: "", page: 1 });
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#1a1a1a]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center gap-2 h-10 px-4 text-[11px] font-bold uppercase tracking-widest border transition-colors ${
              filterOpen
                ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                : "border-[#e5e7eb] text-[#6b7280] hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
            }`}
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
            Filters
          </button>

          <div className="relative ml-auto">
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
        </div>

        <div className={`${filterOpen ? "block" : "hidden"} md:block mb-6`}>
          <div className={`grid grid-cols-1 md:grid-cols-4 gap-4`}>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-[#6b7280] mb-1.5">
                Category
              </label>
              <select
                value={search.brand}
                onChange={(e) => updateSearch({ brand: e.target.value, page: 1 })}
                className="w-full h-10 appearance-none border border-[#e5e7eb] bg-white pl-3 pr-8 text-[12px] font-medium text-[#1a1a1a] outline-none hover:border-[#1a1a1a] transition-colors cursor-pointer"
              >
                <option value="all">All</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-[#6b7280] mb-1.5">
                Size
              </label>
              <select
                value={search.size}
                onChange={(e) => updateSearch({ size: e.target.value, page: 1 })}
                className="w-full h-10 appearance-none border border-[#e5e7eb] bg-white pl-3 pr-8 text-[12px] font-medium text-[#1a1a1a] outline-none hover:border-[#1a1a1a] transition-colors cursor-pointer"
              >
                <option value="all">All</option>
                {sizes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-[#6b7280] mb-1.5">
                Condition
              </label>
              <select
                value={search.era}
                onChange={(e) => updateSearch({ era: e.target.value, page: 1 })}
                className="w-full h-10 appearance-none border border-[#e5e7eb] bg-white pl-3 pr-8 text-[12px] font-medium text-[#1a1a1a] outline-none hover:border-[#1a1a1a] transition-colors cursor-pointer"
              >
                <option value="all">All</option>
                {conditions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-[#6b7280] mb-1.5">
                Price
              </label>
              <select
                value={search.priceRange}
                onChange={(e) => updateSearch({ priceRange: e.target.value, page: 1 })}
                className="w-full h-10 appearance-none border border-[#e5e7eb] bg-white pl-3 pr-8 text-[12px] font-medium text-[#1a1a1a] outline-none hover:border-[#1a1a1a] transition-colors cursor-pointer"
              >
                <option value="all">All</option>
                <option value="under-700">Under EGP 700</option>
                <option value="700-900">EGP 700 – 900</option>
                <option value="over-900">Over EGP 900</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
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

          {hasActiveFilters && (
            <button
              onClick={() =>
                updateSearch({
                  brand: "all",
                  size: "all",
                  era: "all",
                  priceRange: "all",
                  availability: "all",
                  page: 1,
                })
              }
              className="flex items-center gap-1.5 h-10 px-3 text-[11px] font-semibold uppercase tracking-widest text-[#1a1a1a] border border-[#e5e7eb] hover:border-[#1a1a1a] transition-colors"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}

          <div className="flex gap-1 ml-auto">
            {([2, 4] as const).map((n) => (
              <button
                key={n}
                onClick={() => setGridCols(n)}
                className={`h-9 w-9 flex items-center justify-center border transition-colors ${
                  gridCols === n
                    ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                    : "border-[#e5e7eb] text-[#6b7280] hover:border-[#1a1a1a]"
                }`}
                aria-label={`${n} columns`}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor">
                  {n === 2 ? (
                    <>
                      <rect x="0" y="0" width="5.5" height="13" />
                      <rect x="7.5" y="0" width="5.5" height="13" />
                    </>
                  ) : (
                    <>
                      <rect x="0" y="0" width="2.5" height="5.5" />
                      <rect x="3.5" y="0" width="2.5" height="5.5" />
                      <rect x="7" y="0" width="2.5" height="5.5" />
                      <rect x="10.5" y="0" width="2.5" height="5.5" />
                      <rect x="0" y="7.5" width="2.5" height="5.5" />
                      <rect x="3.5" y="7.5" width="2.5" height="5.5" />
                      <rect x="7" y="7.5" width="2.5" height="5.5" />
                      <rect x="10.5" y="7.5" width="2.5" height="5.5" />
                    </>
                  )}
                </svg>
              </button>
            ))}
          </div>
        </div>

        <div
          className={`grid gap-4 md:gap-5 ${gridCols === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"}`}
        >
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-[22px] font-bold text-[#1a1a1a] mb-2">No pieces found</p>
            <p className="text-[13px] text-[#9ca3af] mb-6">
              Try different filters or clear everything
            </p>
            <button
              onClick={() => {
                setQuery("");
                updateSearch({
                  brand: "all",
                  size: "all",
                  era: "all",
                  priceRange: "all",
                  availability: "all",
                  sort: "newest",
                  page: 1,
                });
              }}
              className="h-11 bg-[#1a1a1a] text-white px-8 text-[12px] font-bold uppercase tracking-widest hover:bg-[#6b7280] transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}

        {hasMore && !query.trim() && (
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
