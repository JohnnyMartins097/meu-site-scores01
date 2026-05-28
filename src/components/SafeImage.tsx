import React, { useState } from 'react';

export const SafeImage = ({ src, fallbackType, className, alt, ...props }: any) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 text-slate-400 ${className}`}>
        {fallbackType === 'team' ? '🛡️' : fallbackType === 'flag' ? '🏳️' : '🏆'}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      {...props}
    />
  );
};