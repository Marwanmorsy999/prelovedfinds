type LogoProps = {
  className?: string;
};

export function Logo({ className = "h-6 w-auto" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 220 32"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Preloved Finds"
    >
      <text
        x="0"
        y="24"
        fontFamily="Inter, sans-serif"
        fontSize="20"
        fontWeight="700"
        letterSpacing="2"
        fill="currentColor"
      >
        PRELOVED FINDS
      </text>
    </svg>
  );
}
