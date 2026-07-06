import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/products";
import { StatusBadge } from "./StatusBadge";
import { ImageSlot } from "./ImageSlot";
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";

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
  const oneLeft = product.availability === "one-left";
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(getWishlist().includes(product.id));
  }, [product.id]);

  return (
    <Link to="/product/$id" params={{ id: product.id }} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-surface">
        <ImageSlot
          src={product.images[0]}
          alt={product.title}
          className="transition-transform duration-[400ms] ease-out group-hover:scale-[1.03]"
        />
        {/* Status badges */}
        {oneLeft && (
          <span className="absolute left-3 top-3 z-10 bg-rust px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-paper">
            1 LEFT
          </span>
        )}
        {sold && (
          <span className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 font-display text-2xl font-bold uppercase tracking-tight text-rust -rotate-12">
            SOLD
          </span>
        )}
        {sold && <div className="absolute inset-0 bg-paper/50" aria-hidden />}

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
            className={`h-4 w-4 transition-colors ${saved ? "fill-rust text-rust" : "text-ink"}`}
          />
        </button>
      </div>
      <div className="mt-3 space-y-1">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.05em] text-concrete">
          {product.brand} · {product.era}
        </p>
        <h3 className="text-[16px] font-medium text-ink leading-tight line-clamp-2">
          {product.title}
        </h3>
        <p className="font-mono text-[15px] text-ink">
          {product.price.toLocaleString()} {product.currency}
        </p>
      </div>
    </Link>
  );
}