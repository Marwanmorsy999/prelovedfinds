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
    });
    if (ok) setAdded(true);
  };

  return (
    <div className="group">
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="block"
        aria-label={`View ${product.title}`}
      >
        <div className="relative overflow-hidden bg-surface aspect-[3/4]">
          <ImageSlot
            src={imageSrc}
            alt={product.title}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04] ${sold ? "opacity-70" : ""}`}
          />

          {sold && (
            <div className="absolute top-3 left-3 z-10">
              <span className="bg-paper text-ink text-[11px] font-semibold uppercase tracking-widest px-2.5 py-1 border border-hairline">
                Sold out
              </span>
            </div>
          )}

          {!sold && product.availability === "one-left" && (
            <div className="absolute top-3 left-3 z-10">
              <span className="bg-ink text-paper text-[11px] font-semibold uppercase tracking-widest px-2.5 py-1">
                1 left
              </span>
            </div>
          )}
        </div>
      </Link>

      {!sold && (
        <div className="relative">
          <button
            onClick={handleAdd}
            disabled={inCart}
            className="absolute bottom-0 left-0 right-0 translate-y-0 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300 ease-out w-full bg-ink text-paper py-3 text-[12px] font-semibold uppercase tracking-widest hover:bg-black transition-colors disabled:bg-concrete flex items-center justify-center gap-2"
            aria-label={inCart ? "Added to cart" : `Add ${product.title} to cart`}
          >
            {inCart ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Added
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                Add to cart
              </>
            )}
          </button>
        </div>
      )}

      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="block mt-3 space-y-1"
      >
        <h3 className="text-[14px] font-medium text-ink leading-snug line-clamp-2">
          {product.title}
        </h3>
        <p className="text-[13px] text-concrete">
          {product.priceLabel ? product.priceLabel : `LE ${product.price.toLocaleString()}`}
        </p>
      </Link>
    </div>
  );
}
