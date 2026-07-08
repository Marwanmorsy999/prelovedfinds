import logoSrc from "@/assets/logo.png";

type LogoProps = {
  className?: string;
};

export function Logo({ className = "h-10 w-auto" }: LogoProps) {
  return <img src={logoSrc} alt="Preloved Finds" className={`object-contain ${className}`} />;
}
