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
            className="inline-flex h-12 items-center justify-center bg-white text-[#1a1a1a] px-10 text-[12px] font-semibold uppercase tracking-[0.2em] hover:bg-[#f4f4f4] transition-colors"
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

      {/* Category quick links */}
      <section className="border-t border-[#e5e7eb]">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
          <h2 className="text-[20px] font-bold uppercase tracking-widest text-[#1a1a1a] mb-8 text-center">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Tops", sub: "Tees & shirts" },
              { label: "Bottoms", sub: "Jeans & trousers" },
              { label: "Jackets", sub: "Outerwear" },
              { label: "Sweatshirts", sub: "Pullovers & hoodies" },
            ].map((cat) => (
              <a
                key={cat.label}
                href="/shop"
                className="group flex flex-col items-center justify-center aspect-square bg-[#f4f4f4] hover:bg-[#ebebeb] transition-colors"
              >
                <span className="text-[18px] font-bold uppercase tracking-widest text-[#1a1a1a] group-hover:text-[#6b7280] transition-colors">
                  {cat.label}
                </span>
                <span className="text-[11px] text-[#9ca3af] uppercase tracking-widest mt-1">
                  {cat.sub}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Story strip */}
      <section className="border-t border-[#e5e7eb] bg-[#f9fafb]">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-8 text-center">
          <p className="text-[13px] text-[#6b7280] uppercase tracking-widest mb-3">Our Story</p>
          <p className="mx-auto max-w-lg text-[15px] text-[#1a1a1a] leading-relaxed">
            Hand-picked from Cairo's hidden markets. Every piece has a story — curated for character, condition, and place in fashion history.
          </p>
          <a
            href="/about"
            className="mt-6 inline-flex h-11 items-center justify-center border border-[#1a1a1a] px-8 text-[12px] font-semibold uppercase tracking-widest text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-colors"
          >
            Read our story
          </a>
        </div>
      </section>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
