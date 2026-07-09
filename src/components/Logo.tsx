import logoSrc from "@/assets/logo.webp";

type LogoProps = {
  className?: string;
};

export function Logo({ className = "h-12 w-auto" }: LogoProps) {
  return <img src={logoSrc} alt="Preloved Finds" className={`bg-paper object-contain ${className}`} />;
}
