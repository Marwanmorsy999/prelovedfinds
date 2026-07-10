import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import {
  listProductsFn,
  getDistinctTagsFn,
  getDistinctSizesFn,
  getDistinctConditionsFn,
} from "@/lib/functions/products";

const PER_PAGE = 16;

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
    tag: typeof search.tag === "string" ? search.tag : "all",
    size: typeof search.size === "string" ? search.size : "all",
    condition: typeof search.condition === "string" ? search.condition : "all",
    priceRange: typeof search.priceRange === "string" ? search.priceRange : "all",
    sort: typeof search.sort === "string" ? search.sort : "newest",
    q: typeof search.q === "string" ? search.q : "",
    pages: typeof search.pages === "number" ? search.pages : 1,
  }),
  loaderDeps: ({ search }) => ({
    tag: search.tag,
    size: search.size,
    condition: search.condition,
    priceRange: search.priceRange,
    sort: search.sort,
    q: search.q,
    pages: search.pages,
  }),
  loader: async ({ deps }) => {
    const { tag, size, condition, priceRange, sort, q, pages } = deps;
    const limit = pages * PER_PAGE;
    const [products, tagsRow, sizesRow, conditionsRow] = await Promise.all([
      listProductsFn({
        data: {
          tag: tag === "all" ? undefined : (tag as never),
          size: size === "all" ? undefined : size,
          condition: condition === "all" ? undefined : (condition as never),
          priceRange: priceRange === "all" ? undefined : (priceRange as never),
          sort: sort as never,
          limit,
          q,
        },
      }),
      getDistinctTagsFn(),
      getDistinctSizesFn(),
      getDistinctConditionsFn(),
    ]);
    return {
      products,
      tags: tagsRow,
      sizes: sizesRow,
      conditions: conditionsRow,
    };
  },
  component: Shop,
});

function Shop() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const loader = Route.useLoaderData();
  const { items, total, totalPages } = loader.products;
  const initialTags = Array.isArray(loader.tags) ? loader.tags : [];
  const initialSizes = Array.isArray(loader.sizes) ? loader.sizes : [];
  const [tags] = useState<string[]>(initialTags);
  const [sizes] = useState<string[]>(initialSizes);
  const [conditions, setConditions] = useState<string[]>([]);

  useEffect(() => {
    if (Array.isArray(loader.conditions)) {
      setConditions(loader.conditions);
    }
  }, [loader.conditions]);

  const [filterOpen, setFilterOpen] = useState(false);
  const [query, setQuery] = useState(search.q || "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local query when URL changes externally
  useEffect(() => {
    setQuery(search.q);
  }, [search.q]);

  // Debounce URL update when user types
  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      navigate({
        to: "/shop",
        search: { ...search, q: value, pages: 1 },
        replace: true,
      });
    }, 200);
  };

  // Default 2 cols on mobile (handled by CSS), 4 on desktop
  const [gridCols, setGridCols] = useState<2 | 4>(4);

  const updateSearch = (patch: Record<string, unknown>) =>
    navigate({ to: "/shop", search: { ...search, ...patch } as typeof search, replace: true });

  const currentPage = search.pages;
  const hasMore = currentPage < totalPages;
  const hasActiveFilters =
    search.tag !== "all" ||
    search.size !== "all" ||
    search.condition !== "all" ||
    search.priceRange !== "all";

  return (
    <div className="page-enter">
      <div className="border-b border-hairline px-4 py-7 md:px-8">
        <div className="mx-auto max-w-7xl flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#9ca3af] mb-1">
              Collections
            </p>
            <h1 className="text-[26px] font-bold uppercase tracking-widest text-ink">
              {search.tag !== "all" ? search.tag : "Shop All"}
            </h1>
          </div>
          <p className="text-[12px] text-[#9ca3af] mb-1">{total} items</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        {/* Search + Filter toggle + Sort — one row */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
            <input
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search..."
              className="h-10 w-full border border-hairline bg-paper pl-9 pr-8 text-[13px] text-ink outline-none focus:border-ink transition-colors placeholder:text-[#9ca3af]"
              aria-label="Search products"
            />
            {query && (
              <button
                onClick={() => handleQueryChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-ink"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter toggle — visible on mobile too */}
          <button
            type="button"
            onClick={() => setFilterOpen(!filterOpen)}
            aria-expanded={filterOpen}
            className={`shrink-0 flex items-center gap-1.5 h-10 px-3 text-[11px] font-bold uppercase tracking-widest border transition-opacity duration-150 ${
              filterOpen || hasActiveFilters
                ? "border-ink bg-ink text-paper"
                : "border-hairline text-concrete hover:border-ink hover:text-ink"
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
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-paper text-ink text-[10px] font-bold">
                {[search.tag, search.size, search.condition, search.priceRange].filter(v => v !== "all").length}
              </span>
            )}
          </button>

          {/* Sort */}
          <div className="relative shrink-0">
            <select
              value={search.sort}
              onChange={(e) => updateSearch({ sort: e.target.value, pages: 1 })}
              className="h-10 appearance-none border border-hairline bg-paper pl-3 pr-7 text-[12px] font-semibold uppercase tracking-widest text-ink outline-none hover:border-ink transition-colors cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="featured">Featured</option>
              <option value="price-asc">Low–High</option>
              <option value="price-desc">High–Low</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-concrete" />
          </div>

          {/* Grid toggle — desktop only */}
          <div className="hidden md:flex gap-1 shrink-0">
            {([2, 4] as const).map((n) => (
              <button
                key={n}
                onClick={() => setGridCols(n)}
                className={`h-9 w-9 flex items-center justify-center border transition-colors ${
                  gridCols === n
                    ? "border-ink bg-ink text-paper"
                    : "border-hairline text-concrete hover:border-ink"
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

        {/* Filter panel — compact, collapsible on mobile */}
        <div
          className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none ${
            filterOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="min-h-0">
            <div className="mb-4 p-3 border border-hairline bg-paper">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-concrete mb-1">
                    Category
                  </label>
                  <select
                    value={search.tag}
                    onChange={(e) => updateSearch({ tag: e.target.value, pages: 1 })}
                    className="w-full h-9 appearance-none border border-hairline bg-paper pl-2 pr-6 text-[12px] font-medium text-ink outline-none hover:border-ink transition-colors cursor-pointer"
                  >
                    <option value="all">All</option>
                    {tags.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-concrete mb-1">
                    Condition
                  </label>
                  <select
                    value={search.condition}
                    onChange={(e) => updateSearch({ condition: e.target.value, pages: 1 })}
                    className="w-full h-9 appearance-none border border-hairline bg-paper pl-2 pr-6 text-[12px] font-medium text-ink outline-none hover:border-ink transition-colors cursor-pointer"
                  >
                    <option value="all">All</option>
                    {conditions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-concrete mb-1">
                    Size
                  </label>
                  <select
                    value={search.size}
                    onChange={(e) => updateSearch({ size: e.target.value, pages: 1 })}
                    className="w-full h-9 appearance-none border border-hairline bg-paper pl-2 pr-6 text-[12px] font-medium text-ink outline-none hover:border-ink transition-colors cursor-pointer"
                  >
                    <option value="all">All</option>
                    {sizes.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-concrete mb-1">
                    Price
                  </label>
                  <select
                    value={search.priceRange}
                    onChange={(e) => updateSearch({ priceRange: e.target.value, pages: 1 })}
                    className="w-full h-9 appearance-none border border-hairline bg-paper pl-2 pr-6 text-[12px] font-medium text-ink outline-none hover:border-ink transition-colors cursor-pointer"
                  >
                    <option value="all">All</option>
                    <option value="under-700">Under EGP 700</option>
                    <option value="700-900">EGP 700–900</option>
                    <option value="over-900">Over EGP 900</option>
                  </select>
                </div>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    updateSearch({ tag: "all", size: "all", condition: "all", priceRange: "all", pages: 1 });
                    setFilterOpen(false);
                  }}
                  className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-concrete hover:text-ink transition-colors"
                >
                  <X className="h-3 w-3" /> Clear all filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Product grid — always 2 cols on mobile, toggle on desktop */}
        <div
          className={`grid gap-3 md:gap-5 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${
            gridCols === 4 ? "md:grid-cols-4" : "md:grid-cols-2"
          }`}
        >
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-[22px] font-bold text-ink mb-2">
              {search.q ? `No results for '${search.q}'` : "No pieces found"}
            </p>
            <p className="text-[13px] text-[#9ca3af] mb-6">
              Try different filters or clear everything
            </p>
            <button
              onClick={() => {
                setQuery("");
                updateSearch({
                  tag: "all",
                  size: "all",
                  condition: "all",
                  priceRange: "all",
                  sort: "newest",
                  q: "",
                  pages: 1,
                });
              }}
              className="h-11 bg-ink text-paper px-8 text-[12px] font-bold uppercase tracking-widest hover:bg-concrete transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}

        {hasMore && (
          <div className="mt-14 text-center">
            <button
              onClick={() =>
                navigate({
                  to: "/shop",
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  search: (prev: any) => ({ ...prev, pages: (prev.pages ?? 1) + 1 }),
                  replace: true,
                })
              }
              className="h-11 border border-ink px-10 text-[12px] font-bold uppercase tracking-widest text-ink hover:bg-ink hover:text-paper transition-colors"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  );
}