import React, { useState, useEffect } from "react";

export const SafeImage = ({ src, fallbackType, className, alt, ...props }: any) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
  }, [src]);

  if (hasError || !currentSrc) {
    return (
      <div className={`flex items-center justify-center bg-slate-205/60 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-md select-none ${className}`}>
        {fallbackType === "team" ? (
          <span className="text-xs">🛡️</span>
        ) : fallbackType === "flag" ? (
          <span className="text-xs">🏳️</span>
        ) : (
          <span className="text-xs">🏆</span>
        )}
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt || "Logo"}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => {
        // Fallback sequence:
        // 1. If it's a direct url and not already proxied, try the server proxy endpoint
        if (typeof currentSrc === "string" && currentSrc.startsWith("http") && !currentSrc.includes("/api/proxy-image")) {
          setCurrentSrc(`/api/proxy-image?url=${encodeURIComponent(currentSrc)}`);
        } else {
          // 2. Otherwise flag as error to show CSS fallback emoji
          setHasError(true);
        }
      }}
      {...props}
    />
  );
};
