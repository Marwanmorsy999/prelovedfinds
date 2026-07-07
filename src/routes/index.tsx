import { createFileRoute } from "@tanstack/react-router";
import hero from "@/assets/hero.jpeg";
import { ProductGrid } from "@/components/ProductGrid";
import { Newsletter } from "@/components/Newsletter";
import { listProductsFn } from "@/lib/functions/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Preloved Finds - Curated Vintage Streetwear" },
      {
        name: "description",
        content:
          "One-of-one vintage and pre-owned streetwear. Band tees, denim, workwear - hand-picked from Cairo.",
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
      {/* Hero — full viewport */}
      <section className="relative h-screen min-h-[600px]">
        <div className="absolute inset-0 overflow-hidden bg-[#f4f4f4]">
          <img
            src={hero}
            alt="Featured vintage piece"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-white font-bold text-[40px] md:text-[64px] uppercase tracking-[0.06em] leading-none mb-8">
            Preloved Finds
          </h1>
          <a
            href="/shop"
            className="inline-flex h-12 items-center justify-center bg-[#E8441A] text-white px-10 text-[12px] font-semibold uppercase tracking-[0.2em] hover:bg-[#c73a15] transition-colors"
          >
            Shop All
          </a>
        </div>
      </section>

      {/* New Picks */}
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[20px] font-bold uppercase tracking-widest text-[#1a1a1a]">
            New Picks
          </h2>
          <a
            href="/shop"
            className="text-[12px] font-semibold uppercase tracking-widest text-[#1a1a1a] border-b border-[#1a1a1a] hover:text-[#6b7280] hover:border-[#6b7280] transition-colors pb-0.5"
          >
            View all
          </a>
        </div>
        <ProductGrid products={newPicks} />
      </section>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
