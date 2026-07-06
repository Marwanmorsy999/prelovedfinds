import { createFileRoute, notFound } from "@tanstack/react-router";
import { getProduct, getRelated } from "@/lib/products";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductInfo } from "@/components/ProductInfo";
import { ProductGrid } from "@/components/ProductGrid";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return { product, related: getRelated(product.id) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Not found — Preloved Finds" }, { name: "robots", content: "noindex" }] };
    }
    const { product } = loaderData;
    const title = `${product.title} — Preloved Finds`;
    const desc = `${product.brand} · ${product.era} · ${product.size}. One-of-one at Preloved Finds.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-xl font-semibold text-ink">Something went wrong</h1>
      <p className="mt-2 text-sm text-grey">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-grey">404</p>
      <h1 className="mt-2 text-xl font-semibold text-ink">Piece not found</h1>
      <p className="mt-2 text-sm text-grey">It may have already been snapped up.</p>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product, related } = Route.useLoaderData();
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        <ProductGallery images={product.images} title={product.title} />
        <ProductInfo product={product} />
      </div>

      <section className="mt-24 border-t border-hairline pt-12">
        <div className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-grey">More Picks</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">You may also like</h2>
        </div>
        <ProductGrid products={related} />
      </section>
    </div>
  );
}
