import { useRouterState, Link } from "@tanstack/react-router";

export function Navigation() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const admin = useRouterState({
    select: (s) => s.matches[0]?.context?.admin as boolean | undefined,
  });

  const items = [
    { label: "Shop", href: "/shop" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];
  if (admin) items.push({ label: "Admin", href: "/admin" });

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <nav className="flex items-center gap-1 rounded-full bg-white/75 backdrop-blur-[12px] px-2 py-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`rounded-full px-4 py-2 text-[13px] font-semibold uppercase tracking-[0.2px] transition-all duration-200 ${
                isActive
                  ? "bg-surface text-ink"
                  : "text-ink/70 hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}