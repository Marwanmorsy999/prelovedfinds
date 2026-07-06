import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-20 md:grid-cols-4 md:px-8 md:py-20">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <p className="font-display text-2xl font-bold uppercase tracking-tight text-paper">
            Preloved Finds
          </p>
          <p className="mt-3 max-w-[220px] text-sm leading-relaxed text-concrete">
            Curated vintage & pre-owned streetwear. One-of-one pieces, shipped from Cairo.
          </p>
        </div>

        {/* Shop */}
        <div>
          <p className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-paper/50">
            Shop
          </p>
          <ul className="space-y-3">
            {["New Arrivals", "Denim", "Band Tees", "Outerwear"].map((item) => (
              <li key={item}>
                <a href="/shop" className="text-sm text-concrete hover:text-paper transition-colors">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <p className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-paper/50">
            Support
          </p>
          <ul className="space-y-3">
            {[
              { label: "Size Guide", href: "/shop" },
              { label: "Shipping", href: "/contact" },
              { label: "Returns", href: "/contact" },
              { label: "Contact", href: "/contact" },
            ].map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="text-sm text-concrete hover:text-paper transition-colors"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Social */}
        <div>
          <p className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-paper/50">
            Social
          </p>
          <ul className="space-y-3">
            {[
              { label: "Instagram", href: "https://instagram.com/prelovedfinds" },
              { label: "Email", href: "mailto:hello@prelovedfinds.com" },
            ].map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-concrete hover:text-paper transition-colors"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-paper/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 md:flex-row md:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-concrete/50">
            © {new Date().getFullYear()} Preloved Finds. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "FAQ"].map((item) => (
              <span
                key={item}
                className="font-mono text-[11px] uppercase tracking-[0.05em] text-concrete/50"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Payment icons placeholder */}
      <div className="border-t border-paper/10">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-4 px-4 py-4 md:px-8">
          {["Visa", "Mastercard", "PayPal"].map((method) => (
            <span
              key={method}
              className="font-mono text-[10px] uppercase tracking-[0.08em] text-concrete/40"
            >
              {method}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}