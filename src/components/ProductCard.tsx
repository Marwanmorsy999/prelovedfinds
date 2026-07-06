import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/products";
import { StatusBadge } from "./StatusBadge";
import { ImageSlot } from "./ImageSlot";

export function ProductCard({ product }: { product: Product }) {
  const sold = product.availability === "sold";
  return (
    <Link
      to="/product/$id"
      params={{ id: product.id }}
      className="group block"
    >
      <div className="relative aspect-[4/5] overflow-hidden border border-hairline bg-surface">
        <ImageSlot src={product.images[0]} alt={product.title} />
        <div className="absolute left-3 top-3">
          <StatusBadge status={product.availability} />
        </div>
        {sold && <div className="absolute inset-0 bg-background/40" aria-hidden />}
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-grey">{product.brand} · {product.era}</p>
        <h3 className="text-sm font-medium text-ink line-clamp-2 group-hover:underline">{product.title}</h3>
        <p className="text-sm text-ink">{product.price.toLocaleString()} {product.currency}</p>
      </div>
    </Link>
  );
}
