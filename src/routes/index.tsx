import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero.jpeg";
import logo from "@/assets/logo.jpeg";
import { ProductGrid } from "@/components/ProductGrid";
import { CategoryTiles } from "@/components/CategoryTiles";
import { Newsletter } from "@/components/Newsletter";
import { listProductsFn } from "@/lib/functions/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Preloved Finds — Curated Vintage Streetwear" },
      {
        name: "description",
        content:
          "One-of-one vintage and pre-owned streetwear. Band tees, denim, workwear — hand-picked.",
      },
      { property: "og:title", content: "Preloved Finds — Curated Vintage Streetwear" },
      { property: "og:description", content: "One-of-one vintage and pre-owned streetwear." },
    ],
  }),
  loader: async () => {
    const { items } = await listProductsFn({ data: { sort: "newest", perPage: 4 } });
    return { newPicks: items };
  },
  component: Home,
});

function Home() {
  const { newPicks } = Route.useLoaderData();
  return (
    <div>
      <section className="relative">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface md:aspect-[16/9]">
          <img
            src={hero}
            alt="Featured vintage Public Enemy tee"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <img
              src={logo}
              alt="Preloved Finds"
              className="mb-8 h-32 w-32 rounded-full object-cover shadow-lg md:h-48 md:w-48"
            />
            <h1 className="max-w-3xl font-display text-5xl uppercase leading-[0.95] tracking-tight text-paper md:text-8xl">
              Worn once. Worn well.
              <br />
              Now yours.
            </h1>
            <Link
              to="/shop"
              className="mt-8 border border-paper bg-transparent px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-paper transition-colors hover:bg-white/20"
            >
              Shop All
            </Link>
          </div>
        </div>
      </section>

      <CategoryTiles />

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="mb-10 flex items-end justify-between border-b border-hairline pb-4">
          <div>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-grey">
              Just In
            </p>
            <h2 className="mt-2 font-display text-3xl uppercase tracking-tight text-ink md:text-5xl">
              New Picks
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink hover:opacity-60"
          >
            View all →
          </Link>
        </div>
        <ProductGrid products={newPicks} />
      </section>

      <Newsletter />
    </div>
  );
}