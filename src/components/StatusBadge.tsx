import type { Availability } from "@/lib/products";

export function StatusBadge({ status }: { status: Availability }) {
  if (status === "available") return null;
  const label = status === "sold" ? "Sold out" : "1 left";
  const tone =
    status === "sold"
      ? "bg-[var(--color-outofstock)] text-ink border-[var(--color-outofstock)]"
      : "bg-[var(--color-lowstock)] text-paper border-[var(--color-lowstock)]";
  return (
    <span
      className={`inline-block rounded-full border px-3 py-1 font-sans text-[10px] font-medium uppercase tracking-[0.15em] ${tone}`}
    >
      {label}
    </span>
  );
}
