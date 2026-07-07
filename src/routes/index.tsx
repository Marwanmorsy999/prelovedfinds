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
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />
          <p
            className="relative text-white uppercase tracking-[0.15em]"
            style={{ fontFamily: "'Helvetica Neue Bold', 'Helvetica Neue', 'Inter', sans-serif", lineHeight: 1.5, fontSize: "14px" }}
          >
            <span className="block">worn</span>
            <span className="block">once</span>
            <span className="block">worn</span>
            <span className="block">well</span>
            <span className="block">now</span>
            <span className="block">yours</span>
          </p>
          <a
            href="/shop"
            className="relative inline-flex h-12 items-center justify-center border-2 border-white bg-transparent text-white px-10 uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors mt-8"
            style={{ fontFamily: "'Helvetica Neue Bold', 'Helvetica Neue', 'Inter', sans-serif", fontSize: "14px" }}
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
