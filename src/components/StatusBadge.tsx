import type { Availability } from "@/lib/products";

export function StatusBadge({ status }: { status: Availability }) {
  if (status === "available") return null;
  const label = status === "sold" ? "Sold out" : "1 left";
  const tone =
    status === "sold" ? "bg-ink text-paper border-ink" : "bg-rust text-paper border-rust";
  return (
    <span
      className={`inline-block border px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.15em] ${tone}`}
    >
      {label}
    </span>
  );
}
