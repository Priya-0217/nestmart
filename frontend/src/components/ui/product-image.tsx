'use client';

import Image, { type ImageProps } from 'next/image';
import { useEffect, useState } from 'react';

type ProductImageProps = Omit<ImageProps, 'src' | 'alt'> & {
  src: string;
  alt: string;
  fallbackSrc?: string;
};

const DEFAULT_FALLBACK_SRC = '/product-placeholder.svg';

export function ProductImage({ src, alt, fallbackSrc = DEFAULT_FALLBACK_SRC, onError, ...props }: ProductImageProps) {
  const [resolvedSrc, setResolvedSrc] = useState(src);

  useEffect(() => {
    setResolvedSrc(src);
  }, [src]);

  return (
    <Image
      {...props}
      src={resolvedSrc}
      alt={alt}
      onError={(event) => {
        if (resolvedSrc !== fallbackSrc) {
          setResolvedSrc(fallbackSrc);
        }
        onError?.(event);
      }}
    />
  );
}