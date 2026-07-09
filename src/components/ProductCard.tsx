import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/products";
import { ImageSlot } from "./ImageSlot";
import { Plus, Check } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";

export function ProductCard({ product }: { product: Product }) {
  const sold = product.availability === "sold";
  const { add, isInCart } = useCart();
  const [added, setAdded] = useState(false);

  const inCart = added || isInCart(product.id);
  const imageSrc = product.imageUrl ?? product.images[0];

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = add({
      id: product.id,
      name: product.title,
      price: product.price,
      priceLabel: product.priceLabel,
      imageUrl: product.imageUrl ?? product.images[0],
      size: product.size,
    });
    if (ok) setAdded(true);
  };

  return (
    <div className="group product-card">
      {/* Image */}
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="block relative overflow-hidden bg-[var(--color-hairline)] aspect-[3/4] gpu-accelerated"
        aria-label={`View ${product.title}`}
      >
        <ImageSlot
          src={imageSrc}
          alt={product.title}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04] ${sold ? "opacity-60" : ""}`}
        />

        {/* SOLD badge */}
        {sold && (
          <span className="absolute top-2 left-2 bg-[var(--color-rust)] text-[var(--color-paper)] text-[9px] font-bold uppercase tracking-widest px-2 py-1">
            Sold
          </span>
        )}

        {/* Desktop hover CTA — slides up from bottom */}
        {!sold && (
          <div className="hidden md:flex absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-ink text-paper py-3 items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest">
            {inCart ? (
              <><Check className="h-3.5 w-3.5" /> Added</>
            ) : (
              <><Plus className="h-3.5 w-3.5" /> Add to cart</>
            )}
          </div>
        )}

        {/* Desktop hover CTA click target */}
        {!sold && (
          <button
            onClick={handleAdd}
            disabled={inCart}
            className="hidden md:block absolute bottom-0 inset-x-0 h-[46px] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out opacity-0"
            aria-label={inCart ? "Added to cart" : `Add ${product.title} to cart`}
          />
        )}
      </Link>

      {/* Info row */}
      <div className="mt-2 flex items-start justify-between gap-2">
        <Link to="/product/$id" params={{ id: product.id }} className="block min-w-0 space-y-0.5">
          <h3 className="text-[12px] font-medium text-ink leading-snug line-clamp-2 uppercase tracking-wide">
            {product.title}
          </h3>
          <p className="font-mono text-[11px] text-concrete">
            {product.priceLabel ?? `LE ${product.price.toLocaleString()}`}
          </p>
        </Link>

        {/* Mobile add button — small icon, always visible */}
        {!sold && (
          <button
            onClick={handleAdd}
            disabled={inCart}
            className="md:hidden flex-shrink-0 w-8 h-8 flex items-center justify-center border border-hairline text-ink hover:bg-ink hover:text-paper disabled:text-concrete disabled:border-hairline transition-colors mt-0.5"
            aria-label={inCart ? "Added to cart" : `Add ${product.title} to cart`}
          >
            {inCart ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}