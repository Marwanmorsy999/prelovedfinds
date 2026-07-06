import { useRouterState } from "@tanstack/react-router";
import PillNav from "./PillNav";
import logo from "@/assets/logo.jpeg";

export function Navigation() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="relative h-20 md:h-24">
      <PillNav
        logo={logo}
        logoAlt="Preloved Finds"
        activeHref={pathname}
        baseColor="#111111"
        pillColor="#ffffff"
        hoveredPillTextColor="#ffffff"
        pillTextColor="#111111"
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: "About", href: "/about" },
          { label: "Contact", href: "/#contact" },
        ]}
      />
    </div>
  );
}
