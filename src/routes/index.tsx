import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero.jpeg";
import { ProductGrid } from "@/components/ProductGrid";
import { Newsletter } from "@/components/Newsletter";
import { products } from "@/lib/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Preloved Finds — Curated Vintage Streetwear" },
      { name: "description", content: "One-of-one vintage and pre-owned streetwear. Band tees, denim, workwear — hand-picked." },
      { property: "og:title", content: "Preloved Finds — Curated Vintage Streetwear" },
      { property: "og:description", content: "One-of-one vintage and pre-owned streetwear." },
    ],
  }),
  component: Home,
});

function Home() {
  const newPicks = products.slice(0, 4);
  return (
    <div>
      <section className="relative">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface md:aspect-[16/9]">
          <img src={hero} alt="Featured vintage Public Enemy tee" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-ink/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-background/80">Cairo</p>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold uppercase leading-tight text-background md:text-6xl">
              Worn once. Worn well.<br />Now yours.
            </h1>
            <Link
              to="/shop"
              className="mt-8 border border-background bg-transparent px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-background hover:bg-background hover:text-ink"
            >
              Shop All
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="mb-10 flex items-end justify-between border-b border-hairline pb-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-grey">Just In</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink md:text-3xl">New Picks</h2>
          </div>
          <Link to="/shop" className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink hover:opacity-60">
            View all →
          </Link>
        </div>
        <ProductGrid products={newPicks} />
      </section>

      <Newsletter />
    </div>
  );
}
