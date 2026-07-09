import { cloudinaryUrl } from "@/lib/cloudinary";

type ImageSlotProps = {
  src?: string;
  alt: string;
  className?: string;
  widths?: readonly number[];
  fetchPriority?: "high" | "auto" | "low";
  decoding?: "async" | "auto" | "sync";
  width?: number;
  height?: number;
};

const DEFAULT_WIDTHS = [400, 800, 1200] as const;

export function ImageSlot({
  src,
  alt,
  className = "",
  widths = DEFAULT_WIDTHS,
  fetchPriority,
  decoding = "async",
  width,
  height,
}: ImageSlotProps) {
  if (src) {
    const isCloudinary = src.includes("res.cloudinary.com");
    let srcset = src;
    let sizes = "100vw";

    if (isCloudinary) {
      srcset = widths
        .map((w) => `${cloudinaryUrl(src, { width: w, format: "auto", quality: "auto:good", crop: "limit" })} ${w}w`)
        .join(", ");
      sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";
    }

    const optimizedSrc = isCloudinary
      ? cloudinaryUrl(src, { width: widths[0], format: "auto", quality: "auto:good", crop: "limit" })
      : src;

    return (
      <img
        src={optimizedSrc}
        srcSet={isCloudinary ? srcset : undefined}
        sizes={isCloudinary ? sizes : undefined}
        alt={alt}
        fetchPriority={fetchPriority}
        decoding={decoding}
        width={width}
        height={height}
        className={`h-full w-full object-cover ${className}`}
        loading={fetchPriority === "high" ? "eager" : "lazy"}
      />
    );
  }

  return (
    <div className={`flex h-full w-full items-center justify-center bg-surface ${className}`}>
      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-grey">
        Image coming soon
      </span>
    </div>
  );
}
