import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/products";
import { StatusBadge } from "./StatusBadge";
import { ImageSlot } from "./ImageSlot";
import { Heart, Plus, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart";

function getWishlist(): string[] {
  try {
    return JSON.parse(localStorage.getItem("wishlist") || "[]");
  } catch {
    return [];
  }
}

function toggleWishlist(id: string): boolean {
  const list = getWishlist();
  const idx = list.indexOf(id);
  if (idx > -1) {
    list.splice(idx, 1);
    localStorage.setItem("wishlist", JSON.stringify(list));
    return false;
  }
  list.push(id);
  localStorage.setItem("wishlist", JSON.stringify(list));
  return true;
}

export function ProductCard({ product }: { product: Product }) {
  const sold = product.availability === "sold";
  const [saved, setSaved] = useState(false);
  const { add, isInCart } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setSaved(getWishlist().includes(product.id));
  }, [product.id]);

  const inCart = added || isInCart(product.id);

  return (
    <div className="group">
      <Link to="/product/$id" params={{ id: product.id }} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-surface">
          <ImageSlot
            src={product.images[0]}
            alt={product.title}
            className={`transition-transform duration-[400ms] ease-out group-hover:scale-[1.03] ${sold ? "opacity-60" : ""}`}
          />
          {(sold || product.availability === "one-left") && (
            <div className="absolute left-3 top-3 z-10">
              <StatusBadge status={product.availability} />
            </div>
          )}

          {/* Save heart */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSaved(toggleWishlist(product.id));
            }}
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-paper/90 opacity-0 transition-opacity duration-200 group-hover:opacity-100 md:opacity-0"
            aria-label={saved ? "Unsave item" : "Save item"}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${saved ? "fill-ink text-ink" : "text-ink"}`}
            />
          </button>

          {/* Quick add — faster path to cart without opening the product page */}
          {!sold && (
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
              className="absolute inset-x-2 bottom-2 z-10 flex h-9 items-center justify-center gap-1.5 bg-ink text-[11px] font-medium uppercase tracking-[0.08em] text-paper opacity-0 transition-opacity duration-200 group-hover:opacity-100 disabled:cursor-not-allowed disabled:bg-[#262626] md:opacity-0"
              aria-label={inCart ? `${product.title} added to bag` : `Add ${product.title} to bag`}
            >
              {inCart ? (
                <>
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  Added
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  Add to bag
                </>
              )}
            </button>
          )}
        </div>
        <div className="mt-3 space-y-1">
          <p className="font-sans text-[11px] font-medium uppercase tracking-[0.05em] text-concrete">
            {product.brand} · {product.era}
          </p>
          <h3 className="text-[16px] font-medium text-ink leading-tight line-clamp-2">
            {product.title}
          </h3>
          <p className="font-sans text-[15px] text-ink">
            {product.price.toLocaleString()} {product.currency}
          </p>
        </div>
      </Link>
    </div>
  );
}
