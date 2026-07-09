import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/products";
import {
  listProductsFn,
  getDistinctTagsFn,
  getDistinctConditionsFn,
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
    tag: typeof search.tag === "string" ? search.tag : "all",
    condition: typeof search.condition === "string" ? search.condition : "all",
    priceRange: typeof search.priceRange === "string" ? search.priceRange : "all",
    sort: typeof search.sort === "string" ? search.sort : "newest",
    q: typeof search.q === "string" ? search.q : "",
    page: typeof search.page === "number" ? search.page : 1,
  }),
  loaderDeps: ({ search }) => ({
    tag: search.tag,
    condition: search.condition,
    priceRange: search.priceRange,
    sort: search.sort,
    q: search.q,
    page: search.page,
  }),
  loader: async ({ location }) => {
    const search = location.search as {
      tag?: string;
      condition?: string;
      priceRange?: string;
      sort?: string;
      q?: string;
      page?: number;
    };
    const [products, tagsRow, conditionsRow] = await Promise.all([
      listProductsFn({
        data: {
          tag: search.tag === "all" ? undefined : (search.tag as never),
          condition: search.condition === "all" ? undefined : (search.condition as never),
          priceRange: search.priceRange === "all" ? undefined : (search.priceRange as never),
          sort: search.sort as never,
          page: search.page,
          perPage: 16,
          q: search.q,
        },
      }),
      getDistinctTagsFn(),
      getDistinctConditionsFn(),
    ]);
    return { products, tags: tagsRow, conditions: conditionsRow };
  },
  pendingComponent: () => (
    <div className="min-h-screen bg-paper">
      <div className="border-b border-hairline px-5 py-7">
        <div className="mx-auto max-w-7xl">
          <div className="h-3 w-20 bg-hairline rounded animate-pulse mb-2" />
          <div className="h-7 w-40 bg-hairline rounded animate-pulse" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-5 py-6">
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-[3/4] bg-hairline animate-pulse" />
              <div className="h-3 w-3/4 bg-hairline rounded animate-pulse" />
              <div className="h-3 w-1/3 bg-hairline rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
  component: Shop,
});

const PRICE_LABELS: Record<string, string> = {
  "under-700": "Under EGP 700",
  "700-900": "EGP 700-900",
  "over-900": "Over EGP 900",
};

function Shop() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const loader = Route.useLoaderData();
  const { items, total, totalPages, page } = loader.products;

  const [tags] = useState<string[]>(Array.isArray(loader.tags) ? loader.tags : []);
  const [conditions, setConditions] = useState<string[]>([]);
  useEffect(() => {
    if (Array.isArray(loader.conditions)) setConditions(loader.conditions);
  }, [loader.conditions]);

  const [query, setQuery] = useState(search.q || "");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateSearch({ q: val, page: 1 });
    }, 300);
  };

  const currentPage = Math.min(page, totalPages || 1);

  const [accumulatedItems, setAccumulatedItems] = useState<Product[]>(items);
  const prevSearchKeyRef = useRef(search);
  const prevPageRef = useRef(page);
  const prevItemsLengthRef = useRef(items.length);
  const scrollYRef = useRef(0);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const prevKey = prevSearchKeyRef.current;
    const isFilterChange =
      prevKey.tag !== search.tag ||
      prevKey.condition !== search.condition ||
      prevKey.priceRange !== search.priceRange ||
      prevKey.q !== search.q ||
      prevKey.sort !== search.sort;

    if (isFilterChange || page <= prevPageRef.current) {
      setAccumulatedItems(items);
    } else if (page > prevPageRef.current) {
      setAccumulatedItems((prev) => [...prev, ...items]);
    }

    prevSearchKeyRef.current = search;
    prevPageRef.current = page;
  }, [items, page, search]);

  const displayItems = accumulatedItems.length > 0 ? accumulatedItems : items;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevItemsLengthRef.current = displayItems.length;
      return;
    }
    if (displayItems.length > prevItemsLengthRef.current) {
      window.scrollTo({ top: scrollYRef.current, behavior: "instant" });
    }
    prevItemsLengthRef.current = displayItems.length;
  }, [displayItems.length]);

  const updateSearch = (patch: Record<string, unknown>) =>
    navigate({ to: "/shop", search: { ...search, ...patch } as typeof search });

  const hasMore = currentPage < totalPages;
  const hasActiveFilters =
    search.tag !== "all" || search.condition !== "all" || search.priceRange !== "all";
  const activeFilterCount = [
    search.tag !== "all",
    search.condition !== "all",
    search.priceRange !== "all",
  ].filter(Boolean).length;

  const loadMore = () => {
    scrollYRef.current = window.scrollY;
    updateSearch({ page: currentPage + 1 });
  };

  const clearAllFilters = () =>
    updateSearch({ tag: "all", condition: "all", priceRange: "all", page: 1 });

  const selectClass =
    "appearance-none border border-hairline bg-paper pl-3 pr-7 text-[11px] font-bold uppercase tracking-widest text-ink outline-none hover:border-ink transition-colors cursor-pointer h-10";

  return (
    <div className="min-h-screen bg-paper page-enter">

      {/* Header */}
      <div className="border-b border-hairline px-5 py-6 md:px-10">
        <div className="mx-auto max-w-7xl flex items-end justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-concrete mb-1">
              Collections
            </p>
            <h1 className="font-display text-[28px] md:text-[34px] font-bold uppercase tracking-widest text-ink leading-none">
              {search.tag !== "all" ? search.tag : "Shop All"}
            </h1>
          </div>
          <p className="font-mono text-[11px] text-concrete">{total} pieces</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-0 z-20 bg-paper border-b border-hairline">
        <div className="mx-auto max-w-7xl px-5 md:px-10 py-3 flex items-center gap-3">

          <div className="relative flex-1 min-w-0 max-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-concrete pointer-events-none" />
            <input
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search pieces..."
              className="h-10 w-full border border-hairline bg-paper pl-9 pr-8 text-[12px] text-ink outline-none focus:border-ink transition-colors placeholder:text-concrete"
              aria-label="Search products"
            />
            {query && (
              <button
                onClick={() => { setQuery(""); updateSearch({ q: "", page: 1 }); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-concrete hover:text-ink"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <div className="relative">
              <select value={search.tag} onChange={(e) => updateSearch({ tag: e.target.value, page: 1 })} className={selectClass}>
                <option value="all">Category</option>
                {tags.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-concrete" />
              {search.tag !== "all" && <span className="absolute top-2 right-6 w-1.5 h-1.5 rounded-full bg-rust" />}
            </div>
            <div className="relative">
              <select value={search.condition} onChange={(e) => updateSearch({ condition: e.target.value, page: 1 })} className={selectClass}>
                <option value="all">Condition</option>
                {conditions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-concrete" />
              {search.condition !== "all" && <span className="absolute top-2 right-6 w-1.5 h-1.5 rounded-full bg-rust" />}
            </div>
            <div className="relative">
              <select value={search.priceRange} onChange={(e) => updateSearch({ priceRange: e.target.value, page: 1 })} className={selectClass}>
                <option value="all">Price</option>
                <option value="under-700">Under EGP 700</option>
                <option value="700-900">EGP 700-900</option>
                <option value="over-900">Over EGP 900</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-concrete" />
              {search.priceRange !== "all" && <span className="absolute top-2 right-6 w-1.5 h-1.5 rounded-full bg-rust" />}
            </div>
          </div>

          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden flex items-center gap-1.5 h-10 px-3 text-[11px] font-bold uppercase tracking-widest border border-hairline text-concrete hover:border-ink hover:text-ink transition-colors"
          >
            Filters
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold text-paper bg-rust rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="relative ml-auto">
            <select value={search.sort} onChange={(e) => updateSearch({ sort: e.target.value, page: 1 })} className={selectClass}>
              <option value="newest">Newest</option>
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-concrete" />
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="mx-auto max-w-7xl px-5 md:px-10 pt-4">
          <div className="flex flex-wrap gap-2">
            {search.tag !== "all" && (
              <button
                onClick={() => updateSearch({ tag: "all", page: 1 })}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-rust text-paper hover:opacity-80 transition-opacity"
              >
                <X className="h-2.5 w-2.5" /> {search.tag}
              </button>
            )}
            {search.condition !== "all" && (
              <button
                onClick={() => updateSearch({ condition: "all", page: 1 })}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-rust text-paper hover:opacity-80 transition-opacity"
              >
                <X className="h-2.5 w-2.5" /> {search.condition}
              </button>
            )}
            {search.priceRange !== "all" && (
              <button
                onClick={() => updateSearch({ priceRange: "all", page: 1 })}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-rust text-paper hover:opacity-80 transition-opacity"
              >
                <X className="h-2.5 w-2.5" /> {PRICE_LABELS[search.priceRange]}
              </button>
            )}
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-hairline text-concrete hover:border-ink hover:text-ink transition-colors"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div className="mx-auto max-w-7xl px-5 md:px-10 py-6 md:py-8">
        {displayItems.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              {displayItems.map((p) => (
                <div key={p.id} className="min-w-0 stagger-item">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>

            {hasMore && !query.trim() && (
              <div className="mt-10 text-center">
                <p className="font-mono text-[11px] text-concrete mb-3">
                  Showing {displayItems.length} of {total} pieces
                </p>
                <button
                  onClick={loadMore}
                  className="h-11 border border-ink px-10 text-[11px] font-bold uppercase tracking-widest text-ink hover:bg-ink hover:text-paper transition-colors"
                >
                  Load {Math.min(16, total - displayItems.length)} more
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <p className="font-display text-[72px] font-bold text-rust italic leading-none mb-4 select-none">
              ?
            </p>
            <p className="font-display text-[18px] font-bold uppercase tracking-widest text-ink mb-2">
              No pieces found
            </p>
            <p className="text-[13px] text-concrete mb-8">
              Try different filters or clear everything
            </p>
            <button
              onClick={() => {
                setQuery("");
                updateSearch({ tag: "all", condition: "all", priceRange: "all", sort: "newest", q: "", page: 1 });
              }}
              className="h-11 bg-ink text-paper px-8 text-[11px] font-bold uppercase tracking-widest hover:bg-concrete transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Mobile Filter Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileFilters(false)} />
          <div className="relative w-full bg-paper rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-[16px] font-bold uppercase tracking-widest text-ink">
                Filters
              </h2>
              <button onClick={() => setShowMobileFilters(false)} className="text-concrete hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-concrete mb-1.5">Category</label>
                <select
                  value={search.tag}
                  onChange={(e) => updateSearch({ tag: e.target.value, page: 1 })}
                  className="w-full h-10 appearance-none border border-hairline bg-paper pl-3 pr-8 text-[12px] text-ink outline-none"
                >
                  <option value="all">All</option>
                  {tags.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-concrete mb-1.5">Condition</label>
                <select
                  value={search.condition}
                  onChange={(e) => updateSearch({ condition: e.target.value, page: 1 })}
                  className="w-full h-10 appearance-none border border-hairline bg-paper pl-3 pr-8 text-[12px] text-ink outline-none"
                >
                  <option value="all">All</option>
                  {conditions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-concrete mb-1.5">Price</label>
                <select
                  value={search.priceRange}
                  onChange={(e) => updateSearch({ priceRange: e.target.value, page: 1 })}
                  className="w-full h-10 appearance-none border border-hairline bg-paper pl-3 pr-8 text-[12px] text-ink outline-none"
                >
                  <option value="all">All</option>
                  <option value="under-700">Under EGP 700</option>
                  <option value="700-900">EGP 700-900</option>
                  <option value="over-900">Over EGP 900</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              {hasActiveFilters && (
                <button
                  onClick={() => { clearAllFilters(); setShowMobileFilters(false); }}
                  className="flex-1 h-11 border border-hairline text-[11px] font-bold uppercase tracking-widest text-concrete hover:border-ink hover:text-ink transition-colors"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 h-11 bg-ink text-paper text-[11px] font-bold uppercase tracking-widest hover:bg-concrete transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}