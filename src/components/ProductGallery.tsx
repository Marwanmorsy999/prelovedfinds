import { useState } from "react";
import { ImageSlot } from "./ImageSlot";

export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  // Only show existing images — no empty slots
  const existingImages = images.filter(Boolean);
  const slots = existingImages.length ? existingImages : [undefined];

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        className="relative aspect-[4/5] w-full overflow-hidden bg-surface cursor-zoom-in"
        onClick={() => setZoomed(true)}
      >
        <ImageSlot src={slots[active]} alt={title} />
        {/* Image counter */}
        {slots.length > 1 && (
          <span className="absolute bottom-3 right-3 bg-ink/70 px-2 py-1 font-mono text-[11px] text-paper">
            {active + 1}/{slots.length}
          </span>
        )}
      </div>

      {/* Thumbnails — only if more than 1 image */}
      {slots.length > 1 && (
        <div className="flex gap-2">
          {slots.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-[72px] w-[72px] shrink-0 overflow-hidden bg-surface transition-all duration-200 ${
                i === active ? "ring-2 ring-ink" : "ring-1 ring-transparent hover:ring-concrete"
              }`}
            >
              <ImageSlot src={src} alt={`${title} view ${i + 1}`} />
            </button>
          ))}
        </div>
      )}

      {/* Zoom overlay */}
      {zoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 cursor-zoom-out"
          onClick={() => setZoomed(false)}
        >
          <img
            src={slots[active]}
            alt={title}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
          <button
            onClick={() => setZoomed(false)}
            className="absolute right-6 top-6 text-paper/60 hover:text-paper transition-colors"
            aria-label="Close zoom"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
