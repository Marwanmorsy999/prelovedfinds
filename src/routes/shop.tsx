import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
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
  const search = Route.useSearch();
  const { items, total, totalPages, page } = Route.useLoaderData();
  const [availability, priceRange, sort] = [search.availability, search.priceRange, search.sort];
  const currentPage = Math.min(page, totalPages);

  const updateSearch = (patch: Partial<typeof search>) => {
    Route.navigate({ search: (prev) => ({ ...prev, ...patch }) });
  };

  const paged = useMemo(() => items, [items]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <div className="border-b border-hairline pb-6">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-grey">
          Collection
        </p>
        <h1 className="mt-2 font-display text-4xl uppercase tracking-tight text-ink md:text-6xl">
          Shop All
        </h1>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <FilterDropdown
          label="Availability"
          value={availability}
          onChange={(v) => updateSearch({ availability: v, page: 1 })}
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
          onChange={(v) => updateSearch({ priceRange: v, page: 1 })}
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
          onChange={(v) => updateSearch({ sort: v, page: 1 })}
          options={[
            { value: "featured", label: "Featured" },
            { value: "price-asc", label: "Price low–high" },
            { value: "price-desc", label: "Price high–low" },
            { value: "newest", label: "Newest" },
          ]}
        />

        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-grey">
          {total} items
        </p>
      </div>

      <div className="mt-10">
        {paged.length ? (
          <ProductGrid products={paged} />
        ) : (
          <div className="flex flex-col items-center justify-center border border-hairline bg-surface py-24 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-grey">
              No matches
            </p>
            <p className="mt-3 max-w-sm text-sm text-ink">
              No pieces match your current filters. Try widening your search.
            </p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <nav className="mt-16 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => updateSearch({ page: n })}
              className={`h-10 w-10 border text-xs font-semibold ${n === currentPage ? "border-ink bg-ink text-paper" : "border-hairline text-ink hover:opacity-60"}`}
            >
              {n}
            </button>
          ))}
        </nav>
      )}

      {totalPages > 1 && (
        <div className="mt-4 text-center">
          <Link
            to="/shop"
            className="text-[10px] font-semibold uppercase tracking-[0.2em] text-grey hover:opacity-60"
          >
            Clear filters
          </Link>
        </div>
      )}
    </div>
  );
}
