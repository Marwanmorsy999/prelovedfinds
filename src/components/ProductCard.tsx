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

  return (
    <div className="group">
      <Link to="/product/$id" params={{ id: product.id }} className="block">
        {/* Image container */}
        <div className="relative overflow-hidden bg-[#f4f4f4] aspect-[3/4]">
          <ImageSlot
            src={product.images[0]}
            alt={product.title}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04] ${sold ? "opacity-70" : ""}`}
          />

          {/* Sold out badge */}
          {sold && (
            <div className="absolute top-3 left-3 z-10">
              <span className="bg-white text-[#1a1a1a] text-[11px] font-semibold uppercase tracking-widest px-2.5 py-1 border border-[#e5e7eb]">
                Sold out
              </span>
            </div>
          )}

          {/* 1 left badge */}
          {!sold && product.availability === "one-left" && (
            <div className="absolute top-3 left-3 z-10">
              <span className="bg-[#1a1a1a] text-white text-[11px] font-semibold uppercase tracking-widest px-2.5 py-1">
                1 left
              </span>
            </div>
          )}

          {/* Quick add button — appears on hover */}
          {!sold && (
            <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const ok = add({
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    currency: product.currency,
                  });
                  if (ok) setAdded(true);
                }}
                disabled={inCart}
                className="w-full bg-[#1a1a1a] text-white py-3 text-[12px] font-semibold uppercase tracking-widest hover:bg-black transition-colors disabled:bg-[#6b7280] flex items-center justify-center gap-2"
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
        </div>

        {/* Product info */}
        <div className="mt-3 space-y-1">
          <h3 className="text-[14px] font-medium text-[#1a1a1a] leading-snug line-clamp-2">
            {product.title}
          </h3>
          <p className="text-[13px] text-[#6b7280]">
            LE {product.price.toLocaleString()}
          </p>
          {sold && (
            <p className="text-[11px] text-[#9ca3af] font-medium uppercase tracking-widest">
              Sold out
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}
