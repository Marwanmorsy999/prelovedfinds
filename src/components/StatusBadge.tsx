import type { Availability } from "@/lib/products";

export function StatusBadge({ status }: { status: Availability }) {
  if (status === "available") return null;
  const label = status === "sold" ? "Sold out" : "1 left";
  return (
    <span className="inline-block border border-ink bg-background px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-ink">
      {label}
    </span>
  );
}
