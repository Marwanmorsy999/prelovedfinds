import type { Availability } from "@/lib/products";

export function StatusBadge({ status }: { status: Availability }) {
  if (status === "available") return null;
  if (status === "sold") {
    return (
      <span className="inline-block bg-white text-[#1a1a1a] text-[11px] font-semibold uppercase tracking-widest px-2.5 py-1 border border-[#e5e7eb]">
        Sold out
      </span>
    );
  }
  return (
    <span className="inline-block bg-[#1a1a1a] text-white text-[11px] font-semibold uppercase tracking-widest px-2.5 py-1">
      1 left
    </span>
  );
}
