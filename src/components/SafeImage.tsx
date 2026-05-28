import { useState, useEffect } from "react";

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackType?: "team" | "league" | "avatar" | "flag" | "post";
}

export function SafeImage({ src, fallbackType = "team", className, alt = "image", ...props }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string>("");

  useEffect(() => {
    if (!src) {
      setImgSrc(getFallbackUrl(fallbackType));
      return;
    }

    // Agora o seu PRÓPRIO servidor vai buscar a imagem e limpar os bloqueios!
    const proxiedUrl = `http://localhost:3001/api/proxy-image?url=${encodeURIComponent(src)}`;
    setImgSrc(proxiedUrl);
  }, [src, fallbackType]);

  const getFallbackUrl = (type: string): string => {
    if (type === "team") return "https://www.svgrepo.com/show/406145/shield.svg";
    if (type === "league") return "https://www.svgrepo.com/show/407604/trophy.svg";
    if (type === "flag") return "https://flagcdn.com/w40/un.png";
    if (type === "avatar") return "https://api.dicebear.com/7.x/identicon/svg?seed=fallback";
    return "";
  };

  const handleError = () => {
    setImgSrc(getFallbackUrl(fallbackType));
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}