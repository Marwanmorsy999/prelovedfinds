import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero.jpeg";
import { ProductGrid } from "@/components/ProductGrid";
import { CategoryTiles } from "@/components/CategoryTiles";
import { Newsletter } from "@/components/Newsletter";
import { listProductsFn } from "@/lib/functions/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Preloved Finds - Curated Vintage Streetwear" },
      {
        name: "description",
        content:
          "One-of-one vintage and pre-owned streetwear. Band tees, denim, workwear - hand-picked.",
      },
      { property: "og:title", content: "Preloved Finds - Curated Vintage Streetwear" },
      { property: "og:description", content: "One-of-one vintage and pre-owned streetwear." },
    ],
  }),
  loader: async () => {
    const { items } = await listProductsFn({ data: { sort: "newest", perPage: 8 } });
    return { newPicks: items };
  },
  component: Home,
});

function Home() {
  const { newPicks } = Route.useLoaderData();

  return (
    <div className="page-enter">
      {/* Section 1: Hero — full viewport, single product, editorial */}
      <section className="relative h-screen">
        <div className="absolute inset-0 overflow-hidden bg-surface">
          <img src={hero} alt="Featured vintage piece" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-ink/60 via-ink/20 to-ink/40" />
        </div>
        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-16 md:px-12 md:pb-20">
          <div className="max-w-3xl">
            <p className="font-sans text-2xl font-semibold uppercase tracking-wide text-paper">
              Preloved Finds
            </p>
            <a
              href="/shop"
              className="mt-6 inline-flex h-9 items-center justify-center border border-paper px-6 font-sans text-[13px] font-medium uppercase tracking-[0.1em] text-paper transition-colors hover:bg-paper hover:text-ink"
            >
              Shop All
            </a>
          </div>
        </div>
      </section>

      {/* Section 2: Marquee — handled by MarqueeTicker in __root */}

      {/* Section 3: Featured Drop */}
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-16 md:px-8 md:pt-20 md:pb-20">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-sans text-lg font-medium text-ink">New Picks</h2>
          <a
            href="/shop"
            className="inline-flex h-9 items-center justify-center bg-ink px-6 font-sans text-[12px] font-medium uppercase tracking-[0.08em] text-paper transition-colors hover:bg-[#262626]"
          >
            View all
          </a>
        </div>
        <ProductGrid products={newPicks} />
      </section>

      {/* Section 4: Vintage Collections */}
      <CategoryTiles />

      {/* Section 5: Our story — quiet link through to About */}
      <section className="mx-auto max-w-7xl px-4 py-16 text-center md:px-8 md:py-20">
        <p className="mx-auto max-w-md text-base text-ink/70">
          Hand-picked from Cairo's hidden markets. Every piece has a story.
        </p>
        <Link
          to="/about"
          className="mt-4 inline-flex h-9 items-center justify-center border border-ink px-6 font-sans text-[12px] font-medium uppercase tracking-[0.08em] text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          Read our story
        </Link>
      </section>

      {/* Section 6: Instagram Feed */}
      <section className="mx-auto max-w-7xl px-4 py-16 text-center md:px-8 md:py-20">
        <a
          href="https://instagram.com/prelovedfinds"
          target="_blank"
          rel="noreferrer"
          className="inline-block font-sans text-base font-medium text-ink hover:opacity-70 transition-opacity"
        >
          @prelovedfinds
        </a>
        <p className="mt-1 text-sm text-ink/70">Follow us on Instagram</p>
        <div className="mt-6 grid grid-cols-2 gap-0 md:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square bg-surface" />
          ))}
        </div>
      </section>

      {/* Section 7: Newsletter */}
      <Newsletter />
    </div>
  );
}
