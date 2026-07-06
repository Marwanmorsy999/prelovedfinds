import { Link } from "@tanstack/react-router";

const CATEGORIES = [
  { label: "Denim", sublabel: "12 pieces", image: null },
  { label: "Band Tees", sublabel: "8 pieces", image: null },
  { label: "Outerwear", sublabel: "5 pieces", image: null },
  { label: "Footwear", sublabel: "3 pieces", image: null },
];

export function CategoryTiles() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {CATEGORIES.map((cat) => (
          <a
            key={cat.label}
            href="/shop"
            className="group relative flex aspect-[3/2] flex-col items-start justify-end overflow-hidden bg-surface"
          >
            {/* Background image placeholder — replace with actual product images */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative z-10 p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-paper/70">
                {cat.sublabel}
              </p>
              <h3 className="mt-1 font-display text-3xl font-bold uppercase tracking-tight text-paper">
                {cat.label}
              </h3>
              <span className="mt-2 block font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-paper/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                Shop now →
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}