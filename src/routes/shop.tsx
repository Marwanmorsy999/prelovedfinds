import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { ProductGrid } from "@/components/ProductGrid";
import { FilterDropdown } from "@/components/FilterDropdown";
import { listProductsFn } from "@/lib/functions/products";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop All — Preloved Finds" },
      {
        name: "description",
        content: "Browse every one-of-one vintage piece in stock at Preloved Finds.",
      },
      { property: "og:title", content: "Shop All — Preloved Finds" },
      { property: "og:description", content: "Every one-of-one vintage piece in stock." },
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
        perPage: 8,
      },
    });
  },
  component: Shop,
});

const PER_PAGE = 8;

function Shop() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { items, total, totalPages, page } = Route.useLoaderData();
  const [availability, priceRange, sort] = [search.availability, search.priceRange, search.sort];
  const currentPage = Math.min(page, totalPages);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const updateSearch = (patch: Record<string, unknown>) => {
    navigate({
      to: "/shop",
      search: { ...search, ...patch } as typeof search,
    });
  };

  const paged = useMemo(() => items, [items]);

  // Client-side search filter
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return paged;
    const q = searchQuery.toLowerCase();
    return paged.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.era.toLowerCase().includes(q)
    );
  }, [paged, searchQuery]);

  const loadMore = () => {
    if (currentPage < totalPages) {
      updateSearch({ page: currentPage + 1 });
    }
  };

  const hasMore = currentPage < totalPages;

  return (
    <div className="page-enter mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      {/* Breadcrumb */}
      <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-concrete">
        Shop / Collection
      </p>

      {/* Header */}
      <div className="mt-2 border-b border-concrete pb-6">
        <h1 className="font-display text-5xl font-bold uppercase tracking-tight text-ink md:text-[48px]">
          Shop All
        </h1>
      </div>

      {/* Top bar: search + filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-concrete" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="h-10 w-full border border-concrete bg-paper pl-9 pr-3 text-[13px] text-ink outline-none transition-colors focus:border-ink placeholder:text-concrete"
            aria-label="Search products"
          />
        </div>

        {/* Filter button */}
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className="flex h-10 items-center gap-2 border border-concrete bg-paper px-3 text-[12px] font-medium uppercase tracking-[0.08em] text-ink transition-colors hover:border-ink"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filter
        </button>

        {/* Sort */}
        <FilterDropdown
          label="Sort"
          value={sort}
          onChange={(v) => updateSearch({ sort: v, page: 1 })}
          options={[
            { value: "featured", label: "Featured" },
            { value: "price-asc", label: "Price low–high" },
            { value: "price-desc", label: "Price high–low" },
            { value: "newest", label: "Newest" },
          ]}
        />

        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-concrete">
          {total} items
        </p>
      </div>

      {/* Filter panel */}
      {filterOpen && (
        <div className="mt-4 border border-concrete bg-paper p-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div>
              <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-concrete">
                Availability
              </p>
              <div className="space-y-2">
                {[
                  { value: "all", label: "All" },
                  { value: "available", label: "Available" },
                  { value: "one-left", label: "1 Left" },
                  { value: "sold", label: "Sold Out" },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="availability"
                      checked={availability === opt.value}
                      onChange={() => updateSearch({ availability: opt.value, page: 1 })}
                      className="accent-ink"
                    />
                    <span className="text-sm text-ink">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-concrete">
                Price
              </p>
              <div className="space-y-2">
                {[
                  { value: "all", label: "All" },
                  { value: "under-700", label: "Under 700" },
                  { value: "700-900", label: "700–900" },
                  { value: "over-900", label: "Over 900" },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={priceRange === opt.value}
                      onChange={() => updateSearch({ priceRange: opt.value, page: 1 })}
                      className="accent-ink"
                    />
                    <span className="text-sm text-ink">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => setFilterOpen(false)}
            className="mt-6 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-ink hover:opacity-60 transition-opacity"
          >
            Apply filters
          </button>
        </div>
      )}

      {/* Product grid */}
      <div className="mt-10">
        {filtered.length ? (
          <ProductGrid products={filtered} />
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-concrete">
              No matches found
            </p>
            <p className="mt-3 max-w-sm text-sm text-ink/70">
              Try adjusting your filters or search.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                updateSearch({ availability: "all", priceRange: "all", sort: "featured", page: 1 });
              }}
              className="mt-6 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-ink underline underline-offset-4 hover:opacity-60 transition-opacity"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Load more — replaces numbered pagination */}
      {hasMore && !searchQuery && (
        <div className="mt-16 text-center">
          <button
            onClick={loadMore}
            className="group inline-flex items-center gap-2 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-ink transition-all hover:opacity-60"
          >
            Load more
            <span className="inline-block transition-transform duration-200 group-hover:translate-y-0.5">
              ↓
            </span>
          </button>
        </div>
      )}

      {/* Clear filters link */}
      {totalPages > 1 && (
        <div className="mt-4 text-center">
          <a
            href="/shop"
            className="font-mono text-[11px] uppercase tracking-[0.08em] text-concrete hover:opacity-60 transition-opacity"
          >
            Clear filters
          </a>
        </div>
      )}
    </div>
  );
}