type LogoProps = {
  className?: string;
};

export function Logo({ className = "" }: LogoProps) {
  return (
    <span
      className={`font-bold uppercase tracking-[0.06em] leading-none select-none ${className}`}
      aria-label="Preloved Finds"
    >
      Preloved Finds
    </span>
  );
}
