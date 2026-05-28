'use client';

import React, { useEffect, useState } from 'react';
import Image, { type ImageProps } from 'next/image';

const DEFAULT_FALLBACK_SRC = '/logo.webp';

type SafeProductImageProps = Omit<ImageProps, 'src' | 'alt'> & {
  src?: string | null;
  alt: string;
  fallbackSrc?: string;
};

function normalizeImageSrc(src?: string | null) {
  if (!src || typeof src !== 'string' || src.trim() === '') return DEFAULT_FALLBACK_SRC;
  const cleanSrc = src.trim();

  // Public assets must be referenced from the web root in Next.js.
  // Example: /public/products/a.png -> /products/a.png
  if (cleanSrc.startsWith('/public/')) return cleanSrc.replace('/public', '');

  return cleanSrc;
}

function isRemoteImage(src: string) {
  return /^https?:\/\//i.test(src);
}

export function SafeProductImage({
  src,
  alt,
  fallbackSrc = DEFAULT_FALLBACK_SRC,
  unoptimized,
  onError,
  ...props
}: SafeProductImageProps) {
  const normalizedFallback = normalizeImageSrc(fallbackSrc);
  const [currentSrc, setCurrentSrc] = useState(() => normalizeImageSrc(src));

  useEffect(() => {
    setCurrentSrc(normalizeImageSrc(src));
  }, [src]);

  const remoteImage = isRemoteImage(currentSrc);

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      // In cPanel/standalone hosting, the Next image optimizer often fails for
      // remote product images. Render remote images directly and fall back safely.
      unoptimized={unoptimized ?? remoteImage}
      onError={(event) => {
        if (currentSrc !== normalizedFallback) {
          setCurrentSrc(normalizedFallback);
        }
        onError?.(event);
      }}
    />
  );
}

export function shouldUseUnoptimizedImage(src?: string | null) {
  return isRemoteImage(normalizeImageSrc(src));
}
