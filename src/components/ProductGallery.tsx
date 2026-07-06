import { useState } from "react";
import { ImageSlot } from "./ImageSlot";
import { X, ZoomIn } from "lucide-react";

export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const slots = images.filter(Boolean).length ? images.filter(Boolean) : [undefined];

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        className="relative overflow-hidden bg-[#f4f4f4] aspect-[4/5] cursor-zoom-in group"
        onClick={() => setZoomed(true)}
      >
        <ImageSlot src={slots[active]} alt={title} className="w-full h-full object-cover" />
        {/* Zoom hint */}
        <div className="absolute top-3 right-3 bg-white/80 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="h-4 w-4 text-[#1a1a1a]" />
        </div>
      </div>

      {/* Thumbnails */}
      {slots.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {slots.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`flex-shrink-0 h-20 w-16 overflow-hidden bg-[#f4f4f4] transition-all ${
                i === active
                  ? "ring-2 ring-[#1a1a1a] ring-offset-1"
                  : "ring-1 ring-transparent hover:ring-[#d1d5db]"
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <ImageSlot src={src} alt={`${title} view ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Zoom lightbox */}
      {zoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 cursor-zoom-out"
          onClick={() => setZoomed(false)}
        >
          <img
            src={slots[active]}
            alt={title}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
          <button
            onClick={(e) => { e.stopPropagation(); setZoomed(false); }}
            className="absolute top-5 right-5 bg-white/10 hover:bg-white/20 p-2 transition-colors"
            aria-label="Close zoom"
          >
            <X className="h-5 w-5 text-white" />
          </button>
          {slots.length > 1 && (
            <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/60 text-[12px] uppercase tracking-widest">
              {active + 1} / {slots.length}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
