import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#e5e7eb]">
      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <a href="/" className="inline-block mb-4 hover:opacity-80 transition-opacity">
              <Logo className="h-14 w-auto" />
            </a>
            <p className="text-[13px] text-[#6b7280] leading-relaxed max-w-[220px]">
              Curated vintage & pre-owned pieces. One-of-one, shipped from Cairo.
            </p>
          </div>

          {/* Navigate */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9ca3af] mb-4">
              Navigate
            </p>
            <ul className="space-y-3">
              {[
                { label: "Shop All", href: "/shop" },
                { label: "About Us", href: "/about" },
                { label: "Contact", href: "/contact" },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-[13px] text-[#1a1a1a] hover:text-[#6b7280] transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9ca3af] mb-4">
              Get in Touch
            </p>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://instagram.com/prelovedfinds"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[13px] text-[#1a1a1a] hover:text-[#6b7280] transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-[13px] text-[#1a1a1a] hover:text-[#6b7280] transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#e5e7eb] px-4 py-4 md:px-8">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-2 md:flex-row">
          <p className="text-[11px] text-[#9ca3af] uppercase tracking-widest">
            © {new Date().getFullYear()} Preloved Finds. All rights reserved.
          </p>
          <p className="text-[11px] text-[#9ca3af] uppercase tracking-widest">
            Terms &amp; Policies
          </p>
        </div>
      </div>
    </footer>
  );
}
