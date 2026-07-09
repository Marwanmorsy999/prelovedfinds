import logoSrc from "@/assets/logo.jpg";

type LogoProps = {
  className?: string;
};

export function Logo({ className = "h-24 w-auto" }: LogoProps) {
  return <img src={logoSrc} alt="Preloved Finds" className={`object-contain ${className}`} />;
}
