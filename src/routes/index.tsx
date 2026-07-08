import { createFileRoute, Link } from "@tanstack/react-router";
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
      <section className="relative h-[70vh] min-h-[400px] md:h-screen md:min-h-[600px]">
        <div className="absolute inset-0 overflow-hidden bg-[#f4f4f4]">
          <img src={hero} alt="Featured vintage piece" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <div className="absolute inset-0 bg-black/40 pointer-events-none" />
          <div className="relative space-y-3 md:space-y-4">
            <p
              className="text-white uppercase tracking-[0.15em]"
              style={{
                fontFamily: "'Helvetica Neue Bold', 'Helvetica Neue', 'Inter', sans-serif",
                fontSize: "clamp(20px, 3.5vw, 32px)",
                lineHeight: 1.2,
              }}
            >
              WORN ONCE.
            </p>
            <p
              className="text-white uppercase tracking-[0.15em]"
              style={{
                fontFamily: "'Helvetica Neue Bold', 'Helvetica Neue', 'Inter', sans-serif",
                fontSize: "clamp(20px, 3.5vw, 32px)",
                lineHeight: 1.2,
              }}
            >
              WORN WELL.
            </p>
            <p
              className="text-white uppercase tracking-[0.15em]"
              style={{
                fontFamily: "'Helvetica Neue Bold', 'Helvetica Neue', 'Inter', sans-serif",
                fontSize: "clamp(20px, 3.5vw, 32px)",
                lineHeight: 1.2,
              }}
            >
              NOW YOURS.
            </p>
          </div>
          <Link
            to="/shop"
            search={{
              tag: "all",
              size: "all",
              condition: "all",
              priceRange: "all",
              sort: "newest",
              q: "",
              page: 1,
            }}
            className="relative inline-flex h-12 items-center justify-center border-2 border-white bg-transparent text-white px-10 uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors mt-10 md:mt-14"
            style={{
              fontFamily: "'Helvetica Neue Bold', 'Helvetica Neue', 'Inter', sans-serif",
              fontSize: "14px",
            }}
          >
            Shop All
          </Link>
        </div>
      </section>

      {/* New Picks */}
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[20px] font-bold uppercase tracking-widest text-[#1a1a1a]">
            New Picks
          </h2>
          <Link
            to="/shop"
            search={{
              tag: "all",
              size: "all",
              condition: "all",
              priceRange: "all",
              sort: "newest",
              q: "",
              page: 1,
            }}
            className="text-[12px] font-semibold uppercase tracking-widest text-ink border-b border-ink hover:text-concrete hover:border-concrete transition-colors pb-0.5"
          >
            View all
          </Link>
        </div>
        <ProductGrid products={newPicks} />
      </section>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
