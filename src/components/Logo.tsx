import kbkLogoDark from "@/assets/kbk-logo-dark.png";
import kbkLogoLight from "@/assets/kbk-logo-light.png";

interface LogoProps {
  variant?: "dark" | "light";
  size?: "header" | "footer" | "section";
  className?: string;
}

const sizeClasses = {
  header: "h-14 md:h-16 lg:h-[72px]",
  footer: "h-11 md:h-13 lg:h-14",
  section: "h-14 md:h-16 lg:h-[72px]",
};

const Logo = ({ variant = "dark", size = "header", className = "" }: LogoProps) => {
  const src = variant === "light" ? kbkLogoLight : kbkLogoDark;
  const alt = "KB&K Legacy Shield Logo";

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeClasses[size]} w-auto ${className}`}
    />
  );
};

export default Logo;
