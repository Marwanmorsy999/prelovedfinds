const DEFAULT_ITEMS = [
  "ONE OF ONE PIECES",
  "SHIPPED FROM CAIRO",
  "NEW DROPS WEEKLY",
  "NO RESTOCKS — EVER",
  "AUTHENTICITY GUARANTEED",
];

export function MarqueeTicker({ items = DEFAULT_ITEMS }: { items?: string[] }) {
  const content = (
    <span className="flex shrink-0 items-center gap-3 px-3 font-mono text-[12px] font-medium uppercase tracking-[0.08em]">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-3">
          {item}
          <span aria-hidden className="text-[8px] text-concrete">
            ◆
          </span>
        </span>
      ))}
    </span>
  );

  return (
    <div
      className="overflow-hidden border-y border-concrete bg-surface text-ink"
      aria-hidden="true"
    >
      <div className="marquee-track flex w-max py-2">
        {content}
        {content}
      </div>
    </div>
  );
}
