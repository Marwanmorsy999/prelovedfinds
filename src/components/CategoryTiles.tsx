import { Link } from "@tanstack/react-router";

const CATEGORIES = [
  { label: "Denim", sublabel: "12 pieces" },
  { label: "Band Tees", sublabel: "8 pieces" },
  { label: "Outerwear", sublabel: "5 pieces" },
];

/**
 * CategoryTiles
 * Three evocative entry points between the hero and "New Picks" — gives the
 * homepage a second beat instead of jumping straight to the product grid.
 * Tiles currently all route to /shop (no category filter wired up yet since
 * lib/products.ts has no category field) — swap `to="/shop"` for
 * `to="/shop" search={{ category: cat.label }}` once that's added.
 */
export function CategoryTiles() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.label}
            to="/shop"
            className="group relative flex aspect-[4/3] flex-col items-start justify-end overflow-hidden border border-hairline bg-ink p-5"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-rust/30 opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
            <p className="relative font-mono text-[10px] uppercase tracking-[0.2em] text-paper/70">
              {cat.sublabel}
            </p>
            <h3 className="relative font-display text-3xl uppercase tracking-tight text-paper">
              {cat.label}
            </h3>
            <span className="relative mt-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-paper/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              Shop now →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
