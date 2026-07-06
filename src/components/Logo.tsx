type LogoProps = {
  className?: string;
};

/**
 * Preloved Finds wordmark.
 * Simple ring mark (nods to circularity / pre-loved goods) + a clean two-line
 * Inter lockup. Uses currentColor throughout so it can sit on light or dark
 * backgrounds just by changing the surrounding text color (e.g. text-ink or
 * text-paper) — no invert / mix-blend-mode hacks needed.
 */
export function Logo({ className = "h-8 w-auto" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 200 40"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Preloved Finds"
    >
      <circle
        cx="18"
        cy="20"
        r="13"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="18" cy="20" r="3.2" fill="currentColor" />
      <text
        x="42"
        y="18"
        fontFamily="Inter, sans-serif"
        fontSize="15"
        fontWeight="700"
        letterSpacing="1"
        fill="currentColor"
      >
        PRELOVED
      </text>
      <text
        x="42"
        y="32"
        fontFamily="Inter, sans-serif"
        fontSize="11"
        fontWeight="400"
        letterSpacing="4"
        fill="currentColor"
        opacity="0.7"
      >
        FINDS
      </text>
    </svg>
  );
}
