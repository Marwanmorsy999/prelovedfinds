import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/products";
import { Plus, Check } from "lucide-react";
import { useCart } from "@/lib/cart";

export function ProductCard({ product }: { product: Product }) {
  const sold = product.availability === "sold";
  const { items, add } = useCart();
  const isInCart = items.some((i) => i.id === product.id);

  const imageSrc = product.imageUrl ?? product.images[0];

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add({
      id: product.id,
      name: product.title,
      price: product.price,
      priceLabel: product.priceLabel,
      imageUrl: product.imageUrl ?? product.images[0],
      size: product.size,
    });
  };

  return (
    <div className="group transition-all duration-200 ease-out">
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="block"
        aria-label={`View ${product.title}`}
      >
        <div className="relative w-full aspect-square overflow-hidden bg-white">
          <img
            src={imageSrc}
            alt={product.title}
            loading="lazy"
            decoding="async"
            width={800}
            height={800}
            className={`absolute inset-0 w-full h-full object-contain p-[8%] transition-transform duration-500 group-hover:scale-[1.04] ${sold ? "opacity-70" : ""}`}
          />
        </div>
      </Link>

      {!sold && (
        <div className="relative">
          <button
            onClick={handleAdd}
            disabled={isInCart}
            className="absolute bottom-0 left-0 right-0 translate-y-0 md:translate-y-full md:group-hover:translate-y-0 transition-all duration-200 ease-in-out w-full bg-ink text-paper py-3 text-[12px] font-semibold uppercase tracking-widest hover:bg-[#2d2d2d] active:bg-white active:text-black active:border-black active:scale-[0.97] [&]:[-webkit-tap-highlight-color:transparent] disabled:bg-concrete flex items-center justify-center gap-2"
            aria-label={isInCart ? "Added to cart" : `Add ${product.title} to cart`}
          >
            {isInCart ? (
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

      <Link to="/product/$id" params={{ id: product.id }} className="block mt-3 space-y-1">
        <h3 className="text-[14px] font-medium text-ink leading-snug line-clamp-2">
          {product.title}
        </h3>
        <p className="text-[13px] text-concrete font-['IBM_Plex_Mono']">
          {product.priceLabel ? product.priceLabel : `LE ${product.price.toLocaleString()}`}
        </p>
      </Link>
    </div>
  );
}