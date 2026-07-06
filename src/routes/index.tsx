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
        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-20 md:px-12 md:pb-24">
          <div className="max-w-3xl">
            <h1 className="font-display text-6xl font-extrabold uppercase leading-[0.9] tracking-[-0.04em] text-paper md:text-[96px]">
              Worn once.
              <br />
              Worn well.
              <br />
              Now yours.
            </h1>
            <a
              href="/shop"
              className="group mt-12 inline-flex items-center gap-2 font-mono text-[14px] font-medium uppercase tracking-[0.1em] text-paper transition-all"
            >
              Shop All
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Section 2: Marquee — handled by MarqueeTicker in __root */}

      {/* Section 3: Featured Drop */}
      <section className="mx-auto max-w-7xl px-4 pt-20 pb-16 md:px-8 md:pt-[120px] md:pb-20">
        <div className="relative mb-12">
          <span className="absolute -top-8 left-0 font-display text-[96px] font-extrabold text-concrete/30 select-none">
            {newPicks.length}
          </span>
          <div className="relative">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-concrete">
              Just In
            </p>
            <h2 className="mt-2 font-display text-5xl font-bold uppercase tracking-tight text-ink md:text-[48px]">
              New Arrivals
            </h2>
            <p className="mt-3 max-w-md text-base text-ink/70">
              Curated this week - each piece inspected, photographed, and ready to ship.
            </p>
          </div>
          <a
            href="/shop"
            className="group mt-6 inline-flex items-center gap-2 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-ink transition-all hover:opacity-60"
          >
            View all
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>
        <ProductGrid products={newPicks} />
      </section>

      {/* Section 4: Vintage Collections */}
      <CategoryTiles />

      {/* Section 5: Editorial Banner */}
      <section className="relative h-[60vh] overflow-hidden bg-surface">
        <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/10 to-transparent" />
        <div className="relative flex h-full items-center px-6 md:px-12">
          <div className="max-w-md">
            <h2 className="font-display text-5xl font-bold uppercase leading-[1] tracking-tight text-paper md:text-[48px]">
              Every piece has a story.
            </h2>
            <p className="mt-4 text-base text-paper/85">
              Hand-picked from Cairo's hidden markets. Each item carries history, character, and a
              second chance.
            </p>
            <Link
              to="/about"
              className="group mt-8 inline-flex items-center gap-2 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-paper transition-all"
            >
              Read our story
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Section 6: Instagram Feed */}
      <section className="mx-auto max-w-7xl px-4 py-20 text-center md:px-8 md:py-[120px]">
        <a
          href="https://instagram.com/prelovedfinds"
          target="_blank"
          rel="noreferrer"
          className="inline-block"
        >
          <p className="font-display text-4xl font-bold uppercase tracking-tight text-ink hover:opacity-70 transition-opacity">
            @prelovedfinds
          </p>
        </a>
        <p className="mt-2 text-base text-ink/70">Follow us on Instagram</p>
        {/* Instagram grid placeholder — wire to actual feed */}
        <div className="mt-8 grid grid-cols-2 gap-0 md:grid-cols-3">
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
