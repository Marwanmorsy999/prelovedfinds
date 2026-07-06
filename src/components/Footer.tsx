doesnt import { Instagram } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-hairline bg-surface text-ink">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-12 text-center md:flex-row md:justify-between md:px-8">
        <div>
          <p className="font-display text-xl uppercase tracking-tight text-ink">Preloved Finds</p>
          <p className="mt-2 max-w-xs text-sm text-grey">
            Curated vintage & pre-owned streetwear. One-of-one pieces, shipped from Cairo.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/shop" className="text-sm text-grey hover:opacity-60">
            Shop
          </Link>
          <Link to="/about" className="text-sm text-grey hover:opacity-60">
            About
          </Link>
          <Link to="/contact" className="text-sm text-grey hover:opacity-60">
            Contact
          </Link>
        </div>
      </div>
      <div className="border-t border-hairline">
        <p className="mx-auto max-w-7xl px-4 py-6 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-grey md:px-8">
          © {new Date().getFullYear()} Preloved Finds
        </p>
      </div>
    </footer>
  );
}