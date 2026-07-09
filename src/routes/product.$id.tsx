import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductInfo } from "@/components/ProductInfo";
import { ProductCard } from "@/components/ProductCard";
import { getProductFn, getRelatedFn } from "@/lib/functions/products";

export const Route = createFileRoute("/product/$id")({
  loader: async ({ params }) => {
    const product = await getProductFn({ data: { id: params.id } });
    if (!product) throw notFound();
    const related = await getRelatedFn({ data: { id: product.id } });
    return { product, related };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Not found - Preloved Finds" }, { name: "robots", content: "noindex" }],
      };
    }
    const { product } = loaderData;
    const title = `${product.title} - Preloved Finds`;
    const desc = `${product.tag} · ${product.condition} · ${product.size}. One-of-one at Preloved Finds.`;
    const firstImage = product.images[0] ?? product.imageUrl;
    const imagePreload = firstImage
      ? [
          {
            rel: "preload" as const,
            as: "image" as const,
            href: firstImage.includes("res.cloudinary.com")
              ? firstImage.replace(
                  /(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload)\//,
                  `$1/w_800,f_auto,q_auto:good,c_limit/`,
                )
              : firstImage,
            imagesrcset: [400, 800, 1200]
              .map((w) => {
                const url = firstImage.includes("res.cloudinary.com")
                  ? firstImage.replace(
                      /(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload)\//,
                      `$1/w_${w},f_auto,q_auto:good,c_limit/`,
                    )
                  : firstImage;
                return `${url} ${w}w`;
              })
              .join(", "),
            imagesizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
          },
        ]
      : [];
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
      links: imagePreload,
    };
  },
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-[18px] font-semibold text-[#1a1a1a]">Something went wrong</h1>
      <p className="mt-2 text-[13px] text-[#6b7280]">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#9ca3af]">404</p>
      <h1 className="mt-3 text-[20px] font-bold uppercase tracking-widest text-[#1a1a1a]">
        Piece not found
      </h1>
      <p className="mt-2 text-[13px] text-[#6b7280]">It may have already been snapped up.</p>
      <Link
        to="/shop"
        search={{
          tag: "all",
          condition: "all",
          priceRange: "all",
          sort: "newest",
          q: "",
          page: 1,
        }}
        className="mt-6 inline-flex h-11 items-center justify-center border border-[#1a1a1a] px-8 text-[12px] font-semibold uppercase tracking-widest text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-colors"
      >
        Back to Shop
      </Link>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product, related } = Route.useLoaderData();

  return (
    <div className="page-enter">
      <div className="border-b border-[#e5e7eb] px-4 py-3 md:px-8">
        <p className="text-[11px] text-[#9ca3af] uppercase tracking-widest">
          <Link to="/" className="hover:text-[#1a1a1a] transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link
            to="/shop"
            search={{
              tag: "all",
              condition: "all",
              priceRange: "all",
              sort: "newest",
              q: "",
              page: 1,
            }}
            className="hover:text-[#1a1a1a] transition-colors"
          >
            Shop All
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[#1a1a1a]">{product.title}</span>
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
        <div className="grid gap-10 md:grid-cols-[3fr_2fr] md:gap-14">
          <ProductGallery images={product.images} title={product.title} />
          <ProductInfo product={product} />
        </div>

        {related.length > 0 && (
          <section className="mt-20 border-t border-[#e5e7eb] pt-12">
            <h2 className="text-[20px] font-bold uppercase tracking-widest text-[#1a1a1a] mb-8">
              You may also like
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
