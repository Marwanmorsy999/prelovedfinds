import { Link } from "@tanstack/react-router";

export function Footer({ whatsapp }: { whatsapp?: string }) {
  const waHref = whatsapp ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}` : undefined;

  return (
    <footer className="bg-zinc-900 border-t border-zinc-700">
      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-block mb-4 hover:opacity-80 transition-opacity">
              <span className="font-['Big_Shoulders_Display'] text-xl font-bold text-zinc-100 tracking-widest uppercase">
                Preloved Finds
              </span>
            </Link>
            <p className="text-[13px] text-zinc-400 leading-relaxed max-w-[220px]">
              Curated vintage & pre-owned pieces. One-of-one.
            </p>
          </div>

          {/* Navigate */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 mb-4">
              Navigate
            </p>
            <ul className="space-y-3">
              {[
                { label: "Shop All", href: "/shop" },
                { label: "About Us", href: "/about" },
                { label: "Contact", href: "/contact" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="text-[13px] text-zinc-100 hover:text-orange-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 mb-4">
              Get in Touch
            </p>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://www.instagram.com/preloved.finds._"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[13px] text-zinc-100 hover:text-orange-400 transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-[13px] text-zinc-100 hover:text-orange-400 transition-colors"
                >
                  Contact
                </Link>
              </li>
              {waHref && (
                <li>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[13px] text-zinc-100 hover:text-orange-400 transition-colors"
                  >
                    WhatsApp
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-zinc-700 px-4 py-4 md:px-8">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-2 md:flex-row">
          <p className="text-[11px] text-zinc-400 uppercase tracking-widest">
            © {new Date().getFullYear()} Preloved Finds. All rights reserved.
          </p>
          <Link to="/terms" className="text-[11px] text-zinc-400 uppercase tracking-widest hover:text-orange-400 transition-colors">
            Terms & Policies
          </Link>
        </div>
      </div>
    </footer>
  );
}