import type { Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

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

export function ProductInfo({ product }: { product: Product }) {
  const { add, isInCart, buyNow } = useCart();
  const navigate = useNavigate();
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
    add({
      id: product.id,
      name: product.title,
      price: product.price,
      priceLabel: product.priceLabel,
      imageUrl: product.imageUrl ?? product.images[0],
      size: product.size,
    });
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-6 md:sticky md:top-28 md:self-start">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-concrete mb-1">
          {product.tag}
        </p>
        <h1 className="text-[22px] font-bold text-ink leading-tight">{product.title}</h1>
        <p className="mt-2 text-[18px] font-semibold text-ink">
          {product.priceLabel ? product.priceLabel : `LE ${product.price.toLocaleString()}`}
        </p>
      </div>

      <div>
        {sold && (
          <span className="inline-block bg-surface text-concrete text-[11px] font-semibold uppercase tracking-widest px-3 py-1 border border-hairline">
            Sold out
          </span>
        )}
        {oneLeft && (
          <span className="inline-block bg-ink text-paper text-[11px] font-semibold uppercase tracking-widest px-3 py-1">
            Only 1 left
          </span>
        )}
        {!sold && !oneLeft && (
          <span className="inline-block bg-[#f0fdf4] text-instock text-[11px] font-semibold uppercase tracking-widest px-3 py-1 border border-[#bbf7d0]">
            In stock
          </span>
        )}
      </div>

      <div className="border border-hairline px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-concrete mb-1">
          Condition
        </p>
        <p className="text-[14px] font-medium text-ink">{product.condition}</p>
      </div>

      <div className="border border-hairline px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-concrete mb-1">
          Size
        </p>
        <p className="text-[14px] font-medium text-ink">{product.size}</p>
        <p className="text-[11px] text-[#9ca3af] mt-0.5">One of one — no restocks</p>
      </div>

      <div className="space-y-2.5">
        <button
          disabled={sold || alreadyInCart}
          onClick={handleAdd}
          className="w-full h-12 bg-ink text-paper text-[13px] font-semibold uppercase tracking-widest hover:bg-black transition-colors disabled:bg-[#d1d5db] disabled:cursor-not-allowed disabled:text-[#9ca3af]"
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
            onClick={() => {
              buyNow({
                id: product.id,
                name: product.title,
                price: product.price,
                priceLabel: product.priceLabel,
                imageUrl: product.imageUrl ?? product.images[0],
                size: product.size,
              });
              navigate({ to: "/checkout" });
            }}
            className="w-full h-12 border border-ink bg-paper text-ink text-[13px] font-semibold uppercase tracking-widest hover:bg-surface transition-colors"
          >
            Buy it now
          </button>
        )}
      </div>

      <button
        onClick={() => setSaved(toggleWishlist(product.id))}
        className="flex items-center gap-2 text-[12px] text-concrete hover:text-ink transition-colors"
      >
        <Heart className={`h-4 w-4 ${saved ? "fill-ink text-ink" : ""}`} />
        {saved ? "Saved" : "Save for later"}
      </button>

      {product.description.length > 0 && (
        <div className="border-t border-hairline pt-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-ink mb-3">
            Product Details
          </p>
          <ul className="space-y-1.5">
            {product.description
              .split("\n")
              .filter(Boolean)
              .map((line, i) => (
                <li key={i} className="text-[13px] text-concrete flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-[#9ca3af] flex-shrink-0" />
                  {line}
                </li>
              ))}
          </ul>
        </div>
      )}

      <div className="border-t border-hairline pt-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-ink mb-2">
          Shipping & Returns
        </p>
        <p className="text-[13px] text-concrete">Ships from Cairo. 3–7 business days.</p>
      </div>
    </div>
  );
}
