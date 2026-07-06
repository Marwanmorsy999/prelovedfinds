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
 * Continuous horizontal scroll strip, sits directly under the Navigation
 * on every page. Duplicates its content so the loop reads seamlessly, then
 * animates the duplicated track left with gsap and resets with modulo math
 * (no jump-cut).
 */
export function MarqueeTicker({ items = DEFAULT_ITEMS }: { items?: string[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const distance = track.scrollWidth / 2;
    const tween = gsap.to(track, {
      x: -distance,
      duration: distance / 40, // ~40px per second, constant speed regardless of content length
      ease: "none",
      repeat: -1,
    });

    return () => {
      tween.kill();
    };
  }, [items]);

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
    <div className="overflow-hidden border-y border-hairline bg-rust text-paper" aria-hidden="true">
      <div ref={trackRef} className="flex w-max py-2">
        {content}
        {content}
      </div>
    </div>
  );
}
