import { useRouterState, Link } from "@tanstack/react-router";
import { ShoppingBag, X, Search, Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";

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
    document.body.style.overflow = cartOpen || mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [cartOpen, mobileOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        setCartOpen(false);
      }
    };
    if (cartOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [cartOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (cartOpen) { setCartOpen(false); cartTriggerRef.current?.focus(); }
        if (mobileOpen) setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [cartOpen, mobileOpen]);

  const collectionLinks = [
    { label: "Shop All", href: "/shop" },
    { label: "Tops", href: "/shop?availability=all&priceRange=all&sort=featured&page=1" },
    { label: "Bottoms", href: "/shop?availability=all&priceRange=all&sort=featured&page=1" },
    { label: "Jackets", href: "/shop?availability=all&priceRange=all&sort=featured&page=1" },
    { label: "Sweatshirts", href: "/shop?availability=all&priceRange=all&sort=featured&page=1" },
  ];

  const menuItems = [
    { label: "Shop All", href: "/shop" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    ...(admin ? [{ label: "Admin", href: "/admin" }] : []),
  ];

  const cartTotal = items.reduce((sum, i) => sum + i.price, 0);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#e5e7eb]">
      {/* Top announcement bar */}
      <div className="bg-[#1a1a1a] text-white text-center py-2 text-[12px] tracking-widest font-medium">
        FREE SHIPPING ON ORDERS OVER 1500 EGP
      </div>

      {/* Main nav row */}
      <div className="flex h-14 items-center justify-between px-4 md:px-8">
        {/* Left: hamburger on mobile, search on desktop */}
        <div className="flex items-center gap-3 w-1/3">
          <button
            className="md:hidden p-1 text-[#1a1a1a]"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            className="hidden md:flex p-1 text-[#6b7280] hover:text-[#1a1a1a] transition-colors"
            aria-label="Search"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Center: wordmark */}
        <Link
          to="/"
          className="flex items-center justify-center w-1/3 text-center"
          aria-label="Preloved Finds — home"
        >
          <span className="font-bold text-[18px] tracking-[0.04em] text-[#1a1a1a] uppercase">
            Preloved Finds
          </span>
        </Link>

        {/* Right: cart */}
        <div className="flex items-center justify-end gap-4 w-1/3">
          <div className="relative" ref={cartRef}>
            <button
              ref={cartTriggerRef}
              onClick={() => setCartOpen(!cartOpen)}
              className="relative flex items-center gap-1.5 text-[#1a1a1a] hover:text-[#6b7280] transition-colors"
              aria-label={`Cart (${count})`}
              aria-expanded={cartOpen}
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="text-[12px] font-medium">{count}</span>
              )}
            </button>

            {/* Cart drawer */}
            {cartOpen && (
              <>
                <div
                  className="fixed inset-0 bg-black/20 z-40"
                  onClick={() => setCartOpen(false)}
                />
                <div
                  id="cart-panel"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Shopping cart"
                  className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white z-50 flex flex-col shadow-xl"
                >
                  {/* Cart header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb]">
                    <p className="text-[14px] font-semibold uppercase tracking-widest text-[#1a1a1a]">
                      Your Cart ({count})
                    </p>
                    <button
                      onClick={() => { setCartOpen(false); cartTriggerRef.current?.focus(); }}
                      className="text-[#6b7280] hover:text-[#1a1a1a] transition-colors"
                      aria-label="Close cart"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Cart items */}
                  <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
                    {items.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                        <ShoppingBag className="h-10 w-10 text-[#d1d5db]" />
                        <p className="text-[13px] text-[#6b7280]">Your cart is empty</p>
                        <button
                          onClick={() => setCartOpen(false)}
                          className="text-[12px] underline text-[#1a1a1a] hover:no-underline"
                        >
                          Continue shopping
                        </button>
                      </div>
                    ) : (
                      items.map((item) => (
                        <div key={item.id} className="flex items-start gap-4">
                          <div className="h-20 w-16 bg-[#f4f4f4] flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-[#1a1a1a] leading-tight">{item.title}</p>
                            <p className="text-[12px] text-[#6b7280] mt-1">
                              LE {item.price.toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => remove(item.id)}
                            className="text-[#9ca3af] hover:text-[#1a1a1a] transition-colors mt-0.5"
                            aria-label={`Remove ${item.title}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Cart footer */}
                  {items.length > 0 && (
                    <div className="px-5 py-4 border-t border-[#e5e7eb] space-y-3">
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="font-medium text-[#1a1a1a]">Subtotal</span>
                        <span className="font-semibold text-[#1a1a1a]">
                          LE {cartTotal.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6b7280]">Shipping calculated at checkout</p>
                      <button
                        onClick={() => setCartOpen(false)}
                        className="w-full bg-[#1a1a1a] text-white py-3.5 text-[13px] font-semibold uppercase tracking-widest hover:bg-black transition-colors"
                      >
                        Checkout
                      </button>
                      <button
                        onClick={() => setCartOpen(false)}
                        className="w-full border border-[#e5e7eb] py-3 text-[12px] font-medium text-[#1a1a1a] hover:border-[#1a1a1a] transition-colors"
                      >
                        Continue Shopping
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Desktop category nav */}
      <div className="hidden md:flex items-center justify-center gap-8 py-2 border-t border-[#e5e7eb]">
        {collectionLinks.map((item) => {
          const isActive = pathname === item.href || (item.href === "/shop" && pathname === "/shop");
          return (
            <a
              key={item.label}
              href={item.href}
              className={`text-[12px] font-medium uppercase tracking-widest transition-colors ${
                isActive ? "text-[#1a1a1a]" : "text-[#6b7280] hover:text-[#1a1a1a]"
              }`}
            >
              {item.label}
            </a>
          );
        })}
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          className="fixed inset-0 z-50 bg-white flex flex-col md:hidden"
        >
          <div className="flex items-center justify-between px-4 h-14 border-b border-[#e5e7eb]">
            <span className="font-bold text-[16px] tracking-[0.04em] uppercase">Preloved Finds</span>
            <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5 text-[#1a1a1a]" />
            </button>
          </div>
          <nav className="flex flex-col px-6 py-8 gap-6">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-[22px] font-semibold uppercase tracking-widest text-[#1a1a1a] hover:text-[#6b7280] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="px-6 border-t border-[#e5e7eb] pt-6 space-y-4">
            {collectionLinks.slice(1).map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block text-[14px] font-medium text-[#6b7280] hover:text-[#1a1a1a] uppercase tracking-widest transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
