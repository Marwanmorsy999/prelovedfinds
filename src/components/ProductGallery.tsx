import { useState, useRef, useEffect } from "react";
import { ImageSlot } from "./ImageSlot";
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";

export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);

  const slots = images.filter(Boolean).length ? images.filter(Boolean) : [undefined];

  // Track active slide via IntersectionObserver — no JS scroll handlers
  useEffect(() => {
    const container = galleryRef.current;
    if (!container) return;
    const slides = container.querySelectorAll<HTMLElement>(".slide");
    if (!slides.length) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        }),
      { root: container, threshold: 0.6 },
    );
    slides.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []); // empty deps — runs once after mount, cleans up on unmount

  // Sync scroll when active changes via dots/arrows
  useEffect(() => {
    if (galleryRef.current) {
      galleryRef.current.scrollTo({
        left: active * galleryRef.current.clientWidth,
        behavior: "smooth",
      });
    }
  }, [active]);

  // Preload next image eagerly
  const nextIndex = active + 1 < slots.length ? active + 1 : -1;

  return (
    <div className="space-y-3">
      {/* Main gallery with CSS scroll snapping — no JS drag/swipe */}
      <div className="relative overflow-hidden bg-surface select-none group">
        <div
          ref={galleryRef}
          className="flex overflow-x-scroll snap-x snap-mandatory [scroll-behavior:smooth] [scrollbar-width:none] [-ms-overflow-style:none] [touch-action:pan-x] [-webkit-overflow-scrolling:touch] [will-change:scroll-position] [&::-webkit-scrollbar]:hidden"
        >
          {slots.map((src, i) => (
            <div
              key={i}
              data-index={i}
              className="slide flex-shrink-0 w-full snap-start aspect-square relative [user-select:none]"
              onDoubleClick={() => setZoomed(true)}
            >
              <ImageSlot
                src={src}
                alt={title}
                className="w-full h-full"
                width={800}
                height={800}
                loading={i === 0 ? "eager" : i === nextIndex ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : undefined}
              />
            </div>
          ))}
        </div>

        {/* Zoom hint */}
        <button
          onClick={() => setZoomed(true)}
          className="absolute top-3 right-3 bg-white/80 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
          aria-label="Zoom image"
        >
          <ZoomIn className="h-4 w-4 text-ink" />
        </button>

        {/* Navigation arrows */}
        {slots.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActive((a) => Math.max(0, a - 1));
              }}
              disabled={active === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-4 w-4 text-ink" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActive((a) => Math.min(slots.length - 1, a + 1));
              }}
              disabled={active === slots.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next photo"
            >
              <ChevronRight className="h-4 w-4 text-ink" />
            </button>

            {/* Dots indicator */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {slots.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActive(i);
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === active ? "bg-white w-3" : "bg-white/50 hover:bg-white/80"
                  }`}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Counter */}
        {slots.length > 1 && (
          <div className="absolute top-3 left-3 bg-black/40 text-white text-[11px] font-semibold px-2 py-0.5">
            {active + 1} / {slots.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {slots.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {slots.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`flex-shrink-0 h-20 w-16 overflow-hidden bg-surface transition-all ${
                i === active
                  ? "ring-2 ring-ink ring-offset-1"
                  : "ring-1 ring-transparent hover:ring-[#d1d5db]"
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <ImageSlot
                src={src}
                alt={`${title} view ${i + 1}`}
                className="w-full h-full"
                width={200}
                height={250}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom lightbox with scale-in animation */}
      {zoomed && (
        <div
          className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-black/90 cursor-zoom-out animate-[zoomFadeIn_0.25s_ease-out]"
          onClick={() => setZoomed(false)}
        >
          <img
            src={slots[active]}
            alt={title}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setZoomed(false);
            }}
            className="absolute top-5 right-5 bg-white/10 hover:bg-white/20 p-2 transition-colors"
            aria-label="Close zoom"
          >
            <X className="h-5 w-5 text-white" />
          </button>
          {slots.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActive((a) => Math.max(0, a - 1));
                }}
                disabled={active === 0}
                className="text-white/60 hover:text-white disabled:opacity-30 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <p className="text-white/60 text-[12px] uppercase tracking-widest">
                {active + 1} / {slots.length}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActive((a) => Math.min(slots.length - 1, a + 1));
                }}
                disabled={active === slots.length - 1}
                className="text-white/60 hover:text-white disabled:opacity-30 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}