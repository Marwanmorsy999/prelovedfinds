import { useRouterState, Link } from "@tanstack/react-router";
import { Search, ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import logo from "@/assets/logo.jpeg";

export function Navigation() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const admin = useRouterState({
    select: (s) => s.matches[0]?.context?.admin as boolean | undefined,
  });
  const { count } = useCart();
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

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

  const items: { label: string; href: string }[] = [
    { label: "Shop", href: "/shop" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];
  if (admin) items.push({ label: "Admin", href: "/admin" });

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="flex h-14 items-center justify-between border-b border-concrete bg-paper/85 px-4 backdrop-blur-[16px] md:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
          <img src={logo} alt="Preloved Finds" className="h-8 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {items.map((item) => {
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

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Mobile menu toggle — full overlay nav */}
          <MobileMenu items={items} currentPath={pathname} />

          <button
            className="hidden md:flex items-center justify-center text-ink/60 hover:text-ink transition-colors"
            aria-label="Search"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>

          <button
            className="relative flex items-center justify-center text-ink/60 hover:text-ink transition-colors"
            aria-label="Shopping cart"
          >
            <ShoppingBag className="h-[18px] w-[18px]" />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-rust text-[10px] font-medium text-paper font-mono">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

function MobileMenu({
  items,
  currentPath,
}: {
  items: { label: string; href: string }[];
  currentPath: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [currentPath]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        className="flex md:hidden items-center justify-center text-ink/60 hover:text-ink transition-colors"
        onClick={() => setOpen(true)}
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

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-paper">
          <div className="flex h-14 items-center justify-between border-b border-concrete px-4">
            <img src={logo} alt="Preloved Finds" className="h-8 w-auto" />
            <button
              onClick={() => setOpen(false)}
              className="flex items-center justify-center text-ink/60 hover:text-ink transition-colors"
              aria-label="Close menu"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M5 5l10 10M15 5L5 15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
          <nav className="flex flex-1 flex-col items-center justify-center gap-8">
            {items.map((item) => {
              const isActive = currentPath === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`font-display text-5xl font-bold uppercase tracking-tight transition-colors ${
                    isActive ? "text-ink" : "text-ink/30 hover:text-ink/70"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
