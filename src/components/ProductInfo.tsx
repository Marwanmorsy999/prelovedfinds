import type { Product } from "@/lib/products";
import { StatusBadge } from "./StatusBadge";
import { useCart } from "@/lib/cart";

export function ProductInfo({ product }: { product: Product }) {
  const { add } = useCart();
  const sold = product.availability === "sold";

  return (
    <div className="space-y-8 md:sticky md:top-28 md:self-start">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-grey">
          {product.brand} · {product.era}
        </p>
        <h1 className="text-3xl font-semibold text-ink">{product.title}</h1>
        <p className="text-lg text-ink">
          {product.price.toLocaleString()} {product.currency}
        </p>
        <div>
          <StatusBadge status={product.availability} />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-grey">
          Size
        </label>
        <select
          disabled
          className="w-full cursor-not-allowed border border-hairline bg-surface px-3 py-3 text-sm text-ink"
        >
          <option>
            {product.size}
            {sold ? " — Sold out" : " — One-of-one"}
          </option>
        </select>
        <p className="text-xs text-grey">Each piece is one-of-one secondhand stock.</p>
      </div>

      <button
        disabled={sold}
        onClick={() => add(product.id)}
        className="w-full border border-ink bg-ink px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-background transition hover:opacity-80 disabled:cursor-not-allowed disabled:border-hairline disabled:bg-surface disabled:text-grey"
      >
        {sold ? "Sold out" : "Add to cart"}
      </button>

      <div className="border-t border-hairline pt-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink">Product ID</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-grey">
          {product.productId.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </div>

      <div className="border-t border-hairline pt-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink">
          Measurements
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-grey">
          {product.measurements.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
