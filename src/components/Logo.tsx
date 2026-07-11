import logoSrc from "@/assets/logo.webp";

type LogoProps = {
  className?: string;
};

export function Logo({ className = "h-14 md:h-16 w-auto" }: LogoProps) {
  return (
    <img
      src={logoSrc}
      alt="Preloved Finds"
      className={`object-contain [mix-blend-mode:multiply] ${className}`}
    />
  );
}