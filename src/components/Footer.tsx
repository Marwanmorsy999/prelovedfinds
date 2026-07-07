import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#e5e7eb]">
      {/* Newsletter */}
      <div className="border-b border-[#e5e7eb] py-12 px-4 md:px-8">
        <div className="mx-auto max-w-md text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b7280] mb-3">
            Newsletter
          </p>
          <p className="text-[22px] font-bold uppercase tracking-tight text-[#1a1a1a] mb-2">
            Sign up to access our fly community perks
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-6 flex flex-col sm:flex-row gap-2"
          >
            <input
              type="email"
              required
              placeholder="Email"
              className="flex-1 h-11 px-4 border border-[#e5e7eb] text-[13px] text-[#1a1a1a] outline-none focus:border-[#1a1a1a] transition-colors placeholder:text-[#9ca3af]"
            />
            <button
              type="submit"
              className="h-11 px-6 bg-[#1a1a1a] text-white text-[12px] font-semibold uppercase tracking-widest hover:bg-black transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Links */}
      <div className="mx-auto max-w-7xl grid grid-cols-2 gap-8 px-4 py-10 md:grid-cols-4 md:px-8">
        {/* Brand block */}
        <div className="col-span-2 md:col-span-1">
          <a href="/" className="block mb-3 hover:opacity-70 transition-opacity">
            <Logo className="text-[20px] text-[#1a1a1a]" />
          </a>
          <p className="text-[13px] text-[#6b7280] leading-relaxed max-w-[200px]">
            Curated vintage & pre-owned pieces. One-of-one, shipped from Cairo.
          </p>
          <div className="mt-4 flex gap-4">
            <a
              href="https://instagram.com/prelovedfinds"
              target="_blank"
              rel="noreferrer"
              className="text-[12px] font-semibold uppercase tracking-widest text-[#1a1a1a] hover:text-[#6b7280] transition-colors"
            >
              Instagram
            </a>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b7280] mb-4">Collections</p>
          <ul className="space-y-2.5">
            {["Shop All", "Tops", "Bottoms", "Jackets", "Sweatshirts"].map((item) => (
              <li key={item}>
                <a href="/shop" className="text-[13px] text-[#1a1a1a] hover:text-[#6b7280] transition-colors">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b7280] mb-4">Info</p>
          <ul className="space-y-2.5">
            {[
              { label: "About Us", href: "/about" },
              { label: "Contact", href: "/contact" },
              { label: "Shipping", href: "/contact" },
              { label: "Returns", href: "/contact" },
            ].map((item) => (
              <li key={item.label}>
                <a href={item.href} className="text-[13px] text-[#1a1a1a] hover:text-[#6b7280] transition-colors">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b7280] mb-4">Follow</p>
          <ul className="space-y-2.5">
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
                href="mailto:hello@prelovedfinds.com"
                className="text-[13px] text-[#1a1a1a] hover:text-[#6b7280] transition-colors"
              >
                Email Us
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b7280] mb-4">About</p>
          <p className="text-[13px] text-[#6b7280] leading-relaxed">
            Curated vintage & pre-owned pieces. One-of-one, shipped from Cairo.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#e5e7eb] px-4 py-5 md:px-8">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-2 md:flex-row">
          <p className="text-[11px] text-[#9ca3af] uppercase tracking-widest">
            © {new Date().getFullYear()} Preloved Finds
          </p>
          <div className="flex gap-5">
            {["Terms and Policies", "Privacy", "FAQ"].map((item) => (
              <span key={item} className="text-[11px] text-[#9ca3af] uppercase tracking-widest cursor-default">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
