import { useMemo } from "react";

const CLOUD_NAME = "dnggmrgmu";

/**
 * Transforms a Cloudinary URL to request an optimised size.
 * Falls back to the original URL for non-Cloudinary images.
 */
function cloudinaryUrl(src: string, width: number): string {
  if (src.includes("cloudinary.com")) {
    // Replace /upload/ with /upload/w_{width},q_auto,f_auto/
    return src.replace(
      /\/upload\//,
      `/upload/w_${width},q_auto,f_auto/`,
    );
  }
  return src;
}

export function ImageSlot({
  src,
  alt,
  className = "",
  width = 800,
  height = 800,
  loading = "lazy",
  fetchPriority,
}: {
  src?: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
}) {
  const optimisedSrc = useMemo(
    () => (src ? cloudinaryUrl(src, width) : undefined),
    [src, width],
  );

  if (optimisedSrc) {
    return (
      <div
        className={`relative overflow-hidden ${className}`}
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <img
          src={optimisedSrc}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          fetchPriority={fetchPriority}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-surface ${className}`}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-grey">
        Image coming soon
      </span>
    </div>
  );
}