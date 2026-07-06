import { useRouterState, Link } from "@tanstack/react-router";
import { Search, ShoppingBag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import logo from "@/assets/logo.jpeg";

export function Navigation() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const admin = useRouterState({
    select: (s) => s.matches[0]?.context?.admin as boolean | undefined,
  });
  const { items, remove, count } = useCart();
  const [hidden, setHidden] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastScrollY = useRef(0);
  const cartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current && currentY > 80) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (cartOpen || mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen, mobileOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        setCartOpen(false);
      }
    };
    if (cartOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [cartOpen]);

  const menuItems: { label: string; href: string }[] = [
    { label: "Shop", href: "/shop" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];
  if (admin) menuItems.push({ label: "Admin", href: "/admin" });

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="flex h-14 items-center justify-between border-b border-concrete bg-paper/85 px-4 backdrop-blur-[16px] md:px-8 relative">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            className="flex md:hidden items-center justify-center text-ink/80 hover:text-ink transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M2 5h16M2 10h16M2 15h16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <nav className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`relative text-[13px] font-medium uppercase tracking-[0.08em] transition-colors duration-200 ${
                    isActive ? "text-ink" : "text-ink/60 hover:text-ink"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-rust scale-x-100 transition-transform" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Center logo */}
        <Link
          to="/"
          className="absolute left-1/2 -translate-x-1/2 flex items-center hover:opacity-80 transition-opacity"
        >
          <img src={logo} alt="Preloved Finds" className="h-12 w-auto mix-blend-multiply" />
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          <button
            className="hidden md:flex items-center justify-center text-ink/60 hover:text-ink transition-colors"
            aria-label="Search"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>

          <div className="relative" ref={cartRef}>
            <button
              onClick={() => setCartOpen(!cartOpen)}
              className="relative flex items-center justify-center text-ink/80 hover:text-ink transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-rust text-[11px] font-medium text-paper font-mono">
                  {count}
                </span>
              )}
            </button>

            {cartOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 border border-concrete bg-paper shadow-lg">
                <div className="flex items-center justify-between border-b border-concrete px-4 py-3">
                  <p className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-ink">
                    Your cart ({count})
                  </p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="text-ink/60 hover:text-ink transition-colors"
                    aria-label="Close cart"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="max-h-80 overflow-auto p-2">
                  {items.length === 0 && (
                    <p className="px-2 py-4 text-center text-sm text-concrete">
                      Your cart is empty
                    </p>
                  )}
                  {(() => {
                    const groups = items.reduce<Record<string, number>>((acc, id) => {
                      acc[id] = (acc[id] || 0) + 1;
                      return acc;
                    }, {});
                    return Object.entries(groups).map(([id, qty]) => (
                      <div
                        key={id}
                        className="flex items-center justify-between rounded px-2 py-2 hover:bg-surface"
                      >
                        <span className="truncate text-sm text-ink">
                          {id}
                          <span className="ml-2 text-[11px] text-concrete">x{qty}</span>
                        </span>
                        <button
                          onClick={() => {
                            for (let i = 0; i < qty; i++) remove(id);
                          }}
                          className="text-xs font-medium uppercase tracking-widest text-rust hover:text-rust/80"
                          aria-label={`Remove ${id}`}
                        >
                          Remove
                        </button>
                      </div>
                    ));
                  })()}
                </div>
                {items.length > 0 && (
                  <div className="border-t border-concrete px-4 py-3">
                    <a
                      href="/shop"
                      onClick={() => setCartOpen(false)}
                      className="block text-center font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-ink hover:opacity-60 transition-opacity"
                    >
                      Continue shopping
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-paper md:hidden">
          <div className="flex h-14 items-center justify-between border-b border-concrete px-4">
            <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
              <img src={logo} alt="Preloved Finds" className="h-12 w-auto mix-blend-multiply" />
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center text-ink/80 hover:text-ink transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-1 flex-col items-center justify-center gap-8">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`font-display text-5xl font-bold uppercase tracking-tight transition-colors ${
                    isActive ? "text-ink" : "text-ink/70 hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
