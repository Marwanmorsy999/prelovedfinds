import { useState } from "react";
import { ImageSlot } from "./ImageSlot";

export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const slots = images.length ? images : [undefined, undefined, undefined, undefined];
  const [active, setActive] = useState(0);
  return (
    <div className="space-y-3">
      <div className="aspect-[4/5] w-full bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <ImageSlot src={slots[active]} alt={title} />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {slots.slice(0, 4).map((src, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`aspect-square bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${i === active ? "ring-1 ring-ink" : ""}`}
          >
            <ImageSlot src={src} alt={`${title} view ${i + 1}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
