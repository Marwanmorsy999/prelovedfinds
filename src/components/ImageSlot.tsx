export function ImageSlot({
  src,
  alt,
  className = "",
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`h-full w-full object-cover ${className}`}
        loading="lazy"
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
