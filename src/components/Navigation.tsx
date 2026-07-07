import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { ShoppingBag, X, Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { Logo } from "@/components/Logo";

export function Navigation() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const admin = useRouterState({
    select: (s) => s.matches[0]?.context?.admin as boolean | undefined,
  });
  const { items, remove, count } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);
  const cartTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setMobileOpen(false); setCartOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = cartOpen || mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [cartOpen, mobileOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) setCartOpen(false);
    };
    if (cartOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [cartOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (cartOpen) { setCartOpen(false); cartTriggerRef.current?.focus(); }
        if (mobileOpen) setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [cartOpen, mobileOpen]);

  const navLinks = [
    { label: "Shop All", href: "/shop" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    ...(admin ? [{ label: "Admin", href: "/admin" }] : []),
  ];

  const cartTotal = items.reduce((sum, i) => sum + i.price, 0);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#e5e7eb] transition-all duration-300">
        <div className="mx-auto max-w-7xl flex h-20 items-center justify-between px-4 md:px-8">

          {/* Left: hamburger mobile / nav links desktop */}
          <div className="flex items-center gap-8 w-1/3">
            <button
              className="md:hidden p-1 text-[#1a1a1a] hover:text-[#6b7280] transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <nav className="hidden md:flex items-center gap-7">
              {navLinks.slice(0, 3).map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`relative text-[12px] font-semibold uppercase tracking-widest transition-colors duration-200 group ${
                      active ? "text-[#1a1a1a]" : "text-[#6b7280] hover:text-[#1a1a1a]"
                    }`}
                  >
                    {item.label}
                    <span className={`absolute -bottom-0.5 left-0 h-[2px] bg-[#1a1a1a] transition-all duration-300 ${active ? "w-full" : "w-0 group-hover:w-full"}`} />
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Center: logo */}
          <Link
            to="/"
            className="flex items-center justify-center w-1/3 hover:opacity-85 transition-opacity duration-200"
            aria-label="Preloved Finds — home"
          >
            <Logo className="h-14 w-auto max-w-[180px]" />
          </Link>

          {/* Right: admin link + cart */}
          <div className="flex items-center justify-end gap-5 w-1/3" ref={cartRef}>
            {admin && (
              <Link
                to="/admin"
                className="hidden md:block text-[12px] font-semibold uppercase tracking-widest text-[#6b7280] hover:text-[#1a1a1a] transition-colors"
              >
                Admin
              </Link>
            )}
            <button
              ref={cartTriggerRef}
              onClick={() => setCartOpen(!cartOpen)}
               className="relative flex items-center gap-2 text-[#1a1a1a] hover:text-[#6b7280] transition-colors duration-200 group"
              aria-label={`Cart (${count})`}
            >
              <ShoppingBag className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
              {count > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1a1a1a] text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Cart overlay + drawer */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${cartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setCartOpen(false)}
      />
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-full max-w-[380px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${cartOpen ? "translate-x-0" : "translate-x-full"}`}
        role="dialog" aria-modal="true" aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0]">
          <p className="text-[13px] font-bold uppercase tracking-widest text-[#1a1a1a]">
            Bag {count > 0 && <span className="text-[#1a1a1a]">({count})</span>}
          </p>
          <button
            onClick={() => { setCartOpen(false); cartTriggerRef.current?.focus(); }}
            className="p-1 text-[#9ca3af] hover:text-[#1a1a1a] transition-colors rounded-full hover:bg-[#f4f4f4]"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-20">
              <div className="h-16 w-16 rounded-full bg-[#f4f4f4] flex items-center justify-center">
                <ShoppingBag className="h-7 w-7 text-[#d1d5db]" />
              </div>
              <p className="text-[14px] font-semibold text-[#1a1a1a]">Your bag is empty</p>
              <p className="text-[12px] text-[#9ca3af]">Add some pieces to get started</p>
              <button
                onClick={() => setCartOpen(false)}
                 className="mt-2 h-10 bg-[#1a1a1a] text-white px-6 text-[11px] font-bold uppercase tracking-widest hover:bg-[#6b7280] transition-colors"
              >
                Shop All
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-start gap-3 group">
                <div className="h-20 w-16 bg-[#f4f4f4] flex-shrink-0 overflow-hidden" />
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-[13px] font-medium text-[#1a1a1a] leading-snug line-clamp-2">{item.title}</p>
                  <p className="text-[12px] text-[#9ca3af] mt-1">LE {item.price.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => remove(item.id)}
                   className="mt-0.5 p-1 text-[#d1d5db] hover:text-[#1a1a1a] transition-colors rounded hover:bg-[#f4f4f4] flex-shrink-0"
                  aria-label={`Remove ${item.title}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="px-5 py-5 border-t border-[#f0f0f0] space-y-3 bg-[#fafafa]">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#6b7280] uppercase tracking-widest">Subtotal</span>
              <span className="text-[16px] font-bold text-[#1a1a1a]">LE {cartTotal.toLocaleString()}</span>
            </div>
            <button onClick={() => navigate({ to: "/checkout" })} className="w-full h-12 bg-[#1a1a1a] text-white text-[12px] font-bold uppercase tracking-widest hover:bg-[#6b7280] transition-colors duration-200">
              Checkout
            </button>
            <button onClick={() => setCartOpen(false)} className="w-full h-10 text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] hover:text-[#1a1a1a] transition-colors">
              Continue Shopping
            </button>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-50 bg-white flex flex-col md:hidden transition-transform duration-300 ease-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        role="dialog" aria-modal="true" aria-label="Navigation"
      >
        <div className="flex items-center justify-between px-4 h-16 border-b border-[#f0f0f0]">
          <Logo className="h-11 w-auto" />
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 text-[#9ca3af] hover:text-[#1a1a1a] transition-colors"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex flex-col px-6 pt-10 gap-1">
          {navLinks.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`py-3 text-[24px] font-bold uppercase tracking-widest border-b border-[#f4f4f4] transition-colors duration-150 ${active ? "text-[#1a1a1a]" : "text-[#1a1a1a]"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto px-6 pb-8 pt-6">
          <p className="text-[11px] text-[#9ca3af] uppercase tracking-widest">Preloved Finds · Cairo</p>
        </div>
      </div>
    </>
  );
}
