import { useState, useRef, useCallback } from "react";
import { ImageSlot } from "./ImageSlot";
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";

export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragOffset = useRef(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const slots = images.filter(Boolean).length ? images.filter(Boolean) : [undefined];

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      const next = Math.max(0, Math.min(index, slots.length - 1));
      if (next !== active) {
        setIsTransitioning(true);
        setActive(next);
        setTimeout(() => setIsTransitioning(false), 300);
      }
    },
    [active, slots.length, isTransitioning],
  );

  const goNext = useCallback(() => goTo(active + 1), [goTo, active]);
  const goPrev = useCallback(() => goTo(active - 1), [goTo, active]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragOffset.current = 0;
    if (containerRef.current) {
      containerRef.current.style.cursor = "grabbing";
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    dragOffset.current = e.clientX - dragStartX.current;
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (containerRef.current) {
      containerRef.current.style.cursor = "grab";
    }
    if (Math.abs(dragOffset.current) > 50) {
      if (dragOffset.current < 0) goNext();
      else goPrev();
    }
  };

  const handleMouseLeave = () => {
    if (isDragging.current) {
      handleMouseUp();
    }
  };

  return (
    <div className="space-y-3">
      {/* Main image with swipe support */}
      <div className="relative overflow-hidden bg-surface aspect-[4/5] select-none">
        <div
          ref={containerRef}
          className="relative w-full h-full cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onDoubleClick={() => setZoomed(true)}
        >
          <ImageSlot
            src={slots[active]}
            alt={title}
            className="w-full h-full object-cover pointer-events-none"
          />
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
                goPrev();
              }}
              disabled={active === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4 text-ink" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              disabled={active === slots.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next image"
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
                className="w-full h-full object-cover"
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
                  goPrev();
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
                  goNext();
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
