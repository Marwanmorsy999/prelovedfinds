import { Instagram } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-hairline bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-4 md:px-8">
        <div>
          <p className="font-display text-xl uppercase tracking-tight text-paper">Preloved Finds</p>
          <p className="mt-3 max-w-xs text-sm text-paper/60">
            Curated vintage & pre-owned streetwear. One-of-one pieces, shipped from Cairo.
          </p>
          <a
            href="#"
            aria-label="Instagram"
            className="mt-4 inline-flex items-center gap-2 text-paper/60 hover:text-rust"
          >
            <Instagram className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.18em]">@prelovedfinds</span>
          </a>
        </div>
        <FooterCol
          title="Shop"
          links={[
            ["Shop All", "/shop"],
            ["New Picks", "/shop"],
            ["Sold Archive", "/shop"],
          ]}
        />
        <FooterCol
          title="Help"
          links={[
            ["Sizing", "#"],
            ["Shipping", "#"],
            ["Returns", "#"],
            ["Contact", "/contact"],
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            ["About", "/about"],
            ["Journal", "#"],
          ]}
        />
      </div>
      <div className="border-t border-paper/15">
        <p className="mx-auto max-w-7xl px-4 py-6 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/50 md:px-8">
          © {new Date().getFullYear()} Preloved Finds
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-paper/70">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map(([label, to]) => (
          <li key={label}>
            {to.startsWith("/") ? (
              <Link to={to} className="text-sm text-paper/60 hover:text-rust">
                {label}
              </Link>
            ) : (
              <a href={to} className="text-sm text-paper/60 hover:text-rust">
                {label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
