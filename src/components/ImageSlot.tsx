type ImageSlotProps = {
  src?: string;
  alt: string;
  className?: string;
  widths?: readonly number[];
  fetchPriority?: "high" | "auto" | "low";
  decoding?: "async" | "auto" | "sync";
};

const DEFAULT_WIDTHS = [400, 800, 1200] as const;

export function ImageSlot({
  src,
  alt,
  className = "",
  widths = DEFAULT_WIDTHS,
  fetchPriority,
  decoding = "async",
}: ImageSlotProps) {
  if (src) {
    const isCloudinary = src.includes("res.cloudinary.com");
    let srcset = src;
    let sizes = "100vw";

    if (isCloudinary) {
      const base = src.split("?").shift() ?? src;
      srcset = widths
        .map((w) => `${base}?w=${w}&f_auto&q_auto:good&c_limit${w > 800 ? ",cs_tinysrgb" : ""} ${w}w`)
        .join(", ");
      sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";
    }

    return (
      <img
        src={src}
        srcSet={isCloudinary ? srcset : undefined}
        sizes={isCloudinary ? sizes : undefined}
        alt={alt}
        fetchPriority={fetchPriority}
        decoding={decoding}
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
