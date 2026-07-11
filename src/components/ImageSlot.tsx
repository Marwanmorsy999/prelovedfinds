import { useMemo } from "react";
import { cloudinaryUrl } from "@/lib/cloudinary";

function cloudinaryUrlWithWidth(src: string, width: number): string {
  if (src.includes("cloudinary.com")) {
    return cloudinaryUrl(src, `w_${width},q_auto,f_auto`);
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
    () => (src ? cloudinaryUrlWithWidth(src, width) : undefined),
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