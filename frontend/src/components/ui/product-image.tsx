'use client';

import Image, { type ImageProps } from 'next/image';
import { useEffect, useState } from 'react';

type ProductImageProps = Omit<ImageProps, 'src' | 'alt'> & {
  src: string;
  alt: string;
};

const PLACEHOLDER_SRC = '/product-placeholder.svg';

type Stage = 'primary' | 'picsum' | 'placeholder';

function picsumFallback(src: string): string {
  const tail = src.split('?')[0].split('/').pop() ?? 'nestmart';
  const seed = encodeURIComponent(tail);
  return `https://picsum.photos/seed/${seed}/800/800`;
}

export function ProductImage({ src, alt, onError, ...props }: ProductImageProps) {
  const [stage, setStage] = useState<Stage>('primary');
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setStage('primary');
    setCurrentSrc(src);
  }, [src]);

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={(event) => {
        if (stage === 'primary') {
          setStage('picsum');
          setCurrentSrc(picsumFallback(src));
        } else if (stage === 'picsum') {
          setStage('placeholder');
          setCurrentSrc(PLACEHOLDER_SRC);
        }
        onError?.(event);
      }}
    />
  );
}
