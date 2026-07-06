import type { Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { Heart } from "lucide-react";
import { useState } from "react";

export function ProductInfo({ product }: { product: Product }) {
  const { add, isInCart } = useCart();
  const sold = product.availability === "sold";
  const oneLeft = product.availability === "one-left";
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const alreadyInCart = isInCart(product.id);

  const handleAdd = () => {
    if (sold || adding || alreadyInCart) return;
    setAdding(true);
    setTimeout(() => {
      add({
        id: product.id,
        title: product.title,
        price: product.price,
        currency: product.currency,
      });
      setAdding(false);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }, 500);
  };

  return (
    <div className="space-y-8 md:sticky md:top-20 md:self-start">
      {/* Brand + Title + Price */}
      <div className="space-y-2">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.05em] text-concrete">
          {product.brand} · {product.era}
        </p>
        <h1 className="text-[24px] font-medium text-ink leading-tight">{product.title}</h1>
        <p className="font-mono text-[22px] text-ink">
          {product.price.toLocaleString()} {product.currency}
        </p>
        {/* Status */}
        {oneLeft && (
          <span className="inline-block rounded-full bg-[var(--color-lowstock)] px-3 py-1 font-sans text-[10px] font-medium uppercase tracking-[0.08em] text-paper">
            1 left
          </span>
        )}
        {sold && (
          <span className="inline-block rounded-full bg-[var(--color-outofstock)] px-3 py-1 font-sans text-[10px] font-medium uppercase tracking-[0.08em] text-ink">
            Sold out
          </span>
        )}
        {!sold && !oneLeft && (
          <span className="inline-block rounded-full bg-[var(--color-instock)] px-3 py-1 font-sans text-[10px] font-medium uppercase tracking-[0.08em] text-ink">
            Available
          </span>
        )}
      </div>

      {/* Size — displayed as text, not a select */}
      <div className="space-y-2">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-concrete">
          Size
        </p>
        <p className="text-[15px] text-ink">
          {product.size} <span className="text-concrete">- One-of-one</span>
        </p>
        <p className="font-mono text-[11px] text-concrete">
          Each piece is one-of-one. No restocks.
        </p>
      </div>

      {/* Add to cart / Buy now */}
      <div className="space-y-3">
        <button
          disabled={sold || alreadyInCart}
          onClick={handleAdd}
          className="button-press flex h-[52px] w-full items-center justify-center border border-ink bg-ink font-sans text-[13px] font-medium uppercase tracking-[0.1em] text-paper transition-colors hover:bg-[#262626] disabled:cursor-not-allowed disabled:border-concrete disabled:bg-surface disabled:text-concrete"
        >
          {sold
            ? "Sold out"
            : alreadyInCart
              ? "In cart"
              : added
                ? "Added ✓"
                : adding
                  ? "Adding..."
                  : `Add to cart - ${product.price} ${product.currency}`}
        </button>
        {!sold && (
          <a
            href="/shop"
            onClick={(e) => {
              e.preventDefault();
              handleAdd();
              window.location.href = "/shop";
            }}
            className="flex h-9 w-full items-center justify-center border border-ink bg-transparent font-sans text-[12px] font-medium uppercase tracking-[0.08em] text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            Buy now
          </a>
        )}
      </div>

      {/* Save */}
      <button className="flex items-center gap-2 text-sm text-concrete hover:text-ink transition-colors">
        <Heart className="h-4 w-4" />
        <span>Save for later</span>
      </button>

      {/* Details */}
      {product.productId.length > 0 && (
        <div className="border-t border-concrete pt-6">
          <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-ink">
            Details
          </p>
          <ul className="space-y-1.5">
            {product.productId.map((line, i) => (
              <li key={i} className="text-sm text-ink/80">
                {line}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Measurements */}
      {product.measurements.length > 0 && (
        <div className="border-t border-concrete pt-6">
          <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-ink">
            Measurements
          </p>
          <div className="space-y-1.5">
            {product.measurements.map((line, i) => {
              const [label, value] = line.split(": ");
              return (
                <div key={i} className="flex justify-between text-sm text-ink/80">
                  <span>{label}</span>
                  <span className="font-medium text-ink">{value}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Shipping */}
      <div className="border-t border-concrete pt-6">
        <p className="mb-2 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-ink">
          Shipping & Returns
        </p>
        <p className="text-sm text-ink/80">Ships from Cairo. 3-7 business days.</p>
      </div>
    </div>
  );
}
