import { useRef, useEffect } from "react";
import gsap from "gsap";

const DEFAULT_ITEMS = [
  "ONE OF ONE PIECES",
  "SHIPPED FROM CAIRO",
  "NEW DROPS WEEKLY",
  "NO RESTOCKS — EVER",
];

/**
 * MarqueeTicker
 * Static horizontal strip, sits directly under the Navigation on every page.
 */
export function MarqueeTicker({ items = DEFAULT_ITEMS }: { items?: string[] }) {
  const content = (
    <span className="flex shrink-0 items-center gap-3 px-3 font-mono text-[11px] font-medium uppercase tracking-[0.2em]">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-3">
          {item}
          <span aria-hidden className="text-[8px]">
            ◆
          </span>
        </span>
      ))}
    </span>
  );

  return (
    <div className="overflow-hidden border-y border-hairline bg-surface text-ink" aria-hidden="true">
      <div className="flex w-max py-2">
        {content}
      </div>
    </div>
  );
}