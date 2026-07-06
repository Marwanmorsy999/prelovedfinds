import { useRouterState, Link } from "@tanstack/react-router";
import { Search, ShoppingBag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { Logo } from "@/components/Logo";

export function Navigation() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const admin = useRouterState({
    select: (s) => s.matches[0]?.context?.admin as boolean | undefined,
  });
  const { items, remove, count } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);
  const cartTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setCartOpen(false);
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

  // Close cart on click outside
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

  // Close cart / mobile menu on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (cartOpen) {
          setCartOpen(false);
          cartTriggerRef.current?.focus();
        }
        if (mobileOpen) setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [cartOpen, mobileOpen]);

  const menuItems: { label: string; href: string }[] = [
    { label: "Shop", href: "/shop" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];
  if (admin) menuItems.push({ label: "Admin", href: "/admin" });

  // Group cart items by id for display
  const cartGroups = items.reduce<Record<string, { item: (typeof items)[0]; qty: number }>>(
    (acc, item) => {
      if (acc[item.id]) {
        acc[item.id].qty += 1;
      } else {
        acc[item.id] = { item, qty: 1 };
      }
      return acc;
    },
    {},
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="flex h-14 items-center justify-between border-b border-concrete bg-paper/85 px-4 backdrop-blur-[16px] md:px-8 relative">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            className="flex md:hidden items-center justify-center text-ink/80 hover:text-ink transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M2 5h16M2 10h16M2 15h16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative text-[13px] font-medium uppercase tracking-[0.08em] transition-colors duration-200 ${
                    isActive ? "text-ink" : "text-ink/60 hover:text-ink"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span
                      className="absolute -bottom-1 left-0 right-0 h-[2px] bg-rust scale-x-100 transition-transform"
                      aria-hidden="true"
                    />
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
          aria-label="Preloved Finds — home"
        >
          <Logo className="h-8 w-auto text-ink" />
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          <button
            className="hidden md:flex items-center justify-center text-ink/60 hover:text-ink transition-colors"
            aria-label="Search"
          >
            <Search className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>

          {/* Cart */}
          <div className="relative" ref={cartRef}>
            <button
              ref={cartTriggerRef}
              onClick={() => setCartOpen(!cartOpen)}
              className="relative flex items-center justify-center text-ink/80 hover:text-ink transition-colors"
              aria-label={`Shopping cart, ${count} ${count === 1 ? "item" : "items"}`}
              aria-expanded={cartOpen}
              aria-controls="cart-panel"
              aria-haspopup="dialog"
            >
              <ShoppingBag className="h-[18px] w-[18px]" aria-hidden="true" />
              {count > 0 && (
                <span
                  className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-rust text-[11px] font-medium text-paper font-mono"
                  aria-hidden="true"
                >
                  {count}
                </span>
              )}
            </button>

            {cartOpen && (
              <div
                id="cart-panel"
                role="dialog"
                aria-modal="true"
                aria-label="Shopping cart"
                className="absolute right-0 top-full mt-2 w-80 border border-concrete bg-paper shadow-lg"
              >
                <div className="flex items-center justify-between border-b border-concrete px-4 py-3">
                  <p className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-ink">
                    Your cart ({count})
                  </p>
                  <button
                    onClick={() => {
                      setCartOpen(false);
                      cartTriggerRef.current?.focus();
                    }}
                    className="text-ink/60 hover:text-ink transition-colors"
                    aria-label="Close cart"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="max-h-80 overflow-auto p-2" role="list" aria-label="Cart items">
                  {items.length === 0 && (
                    <p className="px-2 py-4 text-center text-sm text-concrete">
                      Your cart is empty
                    </p>
                  )}
                  {Object.values(cartGroups).map(({ item, qty }) => (
                    <div
                      key={item.id}
                      role="listitem"
                      className="flex items-center justify-between rounded px-2 py-2 hover:bg-surface"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-ink">{item.title}</p>
                        <p className="font-mono text-[11px] text-concrete">
                          {item.price.toLocaleString()} {item.currency}
                          {qty > 1 && <span className="ml-2">×{qty}</span>}
                        </p>
                      </div>
                      <button
                        onClick={() => remove(item.id)}
                        className="ml-3 flex-shrink-0 text-xs font-medium uppercase tracking-widest text-rust hover:text-rust/80 transition-colors"
                        aria-label={`Remove ${item.title} from cart`}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
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
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="fixed inset-0 z-50 flex flex-col bg-paper md:hidden"
        >
          <div className="flex h-14 items-center justify-between border-b border-concrete px-4">
            <Link
              to="/"
              className="flex items-center hover:opacity-80 transition-opacity"
              aria-label="Preloved Finds — home"
            >
              <Logo className="h-8 w-auto text-ink" />
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center text-ink/80 hover:text-ink transition-colors"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <nav
            className="flex flex-1 flex-col items-center justify-center gap-8"
            aria-label="Mobile navigation"
          >
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  aria-current={isActive ? "page" : undefined}
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
