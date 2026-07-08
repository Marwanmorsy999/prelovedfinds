import type { Product } from "@/lib/products";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products, cols = 4 }: { products: Product[]; cols?: 3 | 4 }) {
  const desktop = cols === 3 ? "md:grid-cols-3" : "md:grid-cols-4";
  return (
    <div className={`grid grid-cols-2 gap-x-4 gap-y-10 ${desktop}`}>
      {products.map((p) => (
        <div key={p.id} className="min-w-0">
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}
