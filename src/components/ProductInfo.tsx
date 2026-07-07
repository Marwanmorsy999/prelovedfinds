import type { Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";

function getWishlist(): string[] {
  try { return JSON.parse(localStorage.getItem("wishlist") || "[]"); }
  catch { return []; }
}

function toggleWishlist(id: string): boolean {
  const list = getWishlist();
  const idx = list.indexOf(id);
  if (idx > -1) { list.splice(idx, 1); localStorage.setItem("wishlist", JSON.stringify(list)); return false; }
  list.push(id); localStorage.setItem("wishlist", JSON.stringify(list)); return true;
}

export function ProductInfo({ product }: { product: Product }) {
  const { add, isInCart } = useCart();
  const sold = product.availability === "sold";
  const oneLeft = product.availability === "one-left";
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [saved, setSaved] = useState(false);
  const alreadyInCart = isInCart(product.id);

  useEffect(() => {
    setSaved(getWishlist().includes(product.id));
  }, [product.id]);

  const handleAdd = () => {
    if (sold || adding || alreadyInCart) return;
    setAdding(true);
    setTimeout(() => {
      add({ id: product.id, title: product.title, price: product.price, currency: product.currency });
      setAdding(false);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }, 400);
  };

  return (
    <div className="space-y-6 md:sticky md:top-28 md:self-start">
      {/* Title & price */}
      <div>
        <h1 className="text-[22px] font-bold text-[#1a1a1a] leading-tight">
          {product.title}
        </h1>
        <p className="mt-2 text-[18px] font-semibold text-[#1a1a1a]">
          LE {product.price.toLocaleString()}
        </p>
      </div>

      {/* Availability badge */}
      <div>
        {sold && (
          <span className="inline-block bg-[#f4f4f4] text-[#6b7280] text-[11px] font-semibold uppercase tracking-widest px-3 py-1 border border-[#e5e7eb]">
            Sold out
          </span>
        )}
        {oneLeft && (
          <span className="inline-block bg-[#1a1a1a] text-white text-[11px] font-semibold uppercase tracking-widest px-3 py-1">
            Only 1 left
          </span>
        )}
        {!sold && !oneLeft && (
          <span className="inline-block bg-[#f0fdf4] text-[#16a34a] text-[11px] font-semibold uppercase tracking-widest px-3 py-1 border border-[#bbf7d0]">
            In stock
          </span>
        )}
      </div>

      {/* Size */}
      <div className="border border-[#e5e7eb] px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6b7280] mb-1">Size</p>
        <p className="text-[14px] font-medium text-[#1a1a1a]">{product.size}</p>
        <p className="text-[11px] text-[#9ca3af] mt-0.5">One-of-one — no restocks</p>
      </div>

      {/* Add to cart */}
      <div className="space-y-2.5">
        <button
          disabled={sold || alreadyInCart}
          onClick={handleAdd}
          className="w-full h-12 bg-[#1a1a1a] text-white text-[13px] font-semibold uppercase tracking-widest hover:bg-black transition-colors disabled:bg-[#d1d5db] disabled:cursor-not-allowed disabled:text-[#9ca3af]"
        >
          {sold
            ? "Sold Out"
            : alreadyInCart
              ? "In Cart ✓"
              : added
                ? "Added ✓"
                : adding
                  ? "Adding..."
                  : "Add to Cart"}
        </button>

        {!sold && (
          <button
            onClick={handleAdd}
            className="w-full h-12 border border-[#1a1a1a] bg-white text-[#1a1a1a] text-[13px] font-semibold uppercase tracking-widest hover:bg-[#f4f4f4] transition-colors"
          >
            Buy it now
          </button>
        )}
      </div>

      {/* Save */}
      <button
        onClick={() => setSaved(toggleWishlist(product.id))}
        className="flex items-center gap-2 text-[12px] text-[#6b7280] hover:text-[#1a1a1a] transition-colors"
      >
        <Heart className={`h-4 w-4 ${saved ? "fill-[#1a1a1a] text-[#1a1a1a]" : ""}`} />
        {saved ? "Saved" : "Save for later"}
      </button>

      {/* Product details */}
      {product.productId.length > 0 && (
        <div className="border-t border-[#e5e7eb] pt-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#1a1a1a] mb-3">
            Product Details
          </p>
          <ul className="space-y-1.5">
            {product.productId.map((line, i) => (
              <li key={i} className="text-[13px] text-[#6b7280] flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-[#9ca3af] flex-shrink-0" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Measurements */}
      {product.measurements.length > 0 && (
        <div className="border-t border-[#e5e7eb] pt-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#1a1a1a] mb-3">
            Measurements
          </p>
          <div className="space-y-2">
            {product.measurements.map((line, i) => {
              const parts = line.split(": ");
              const label = parts[0];
              const value = parts.slice(1).join(": ");
              return (
                <div key={i} className="flex justify-between text-[13px] border-b border-[#f4f4f4] pb-2 last:border-0">
                  <span className="text-[#6b7280]">{label}</span>
                  <span className="font-medium text-[#1a1a1a]">{value || line}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Shipping */}
      <div className="border-t border-[#e5e7eb] pt-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#1a1a1a] mb-2">
          Shipping & Returns
        </p>
        <p className="text-[13px] text-[#6b7280]">Ships from Cairo. 3–7 business days.</p>
      </div>
    </div>
  );
}
