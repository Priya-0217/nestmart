'use client';

import Image, { type ImageProps } from 'next/image';
import { useEffect, useState } from 'react';

type ProductImageProps = Omit<ImageProps, 'src' | 'alt'> & {
  src: string;
  alt: string;
  category?: string;
};

const PLACEHOLDER_SRC = '/product-placeholder.svg';
const BROKEN_IMAGE_REPLACEMENTS: Record<string, string> = {
  'photo-1507473884658-c70b6559bbcd': 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=1400&auto=format&fit=crop'
};

const CATEGORY_FALLBACK: Record<string, string> = {
  'Living Room': 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1400&auto=format&fit=crop',
  Lighting: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=1400&auto=format&fit=crop',
  Kitchen: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=1400&auto=format&fit=crop',
  Bedroom: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1400&auto=format&fit=crop',
  Dining: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1400&auto=format&fit=crop',
  Decor: 'https://images.unsplash.com/photo-1600607688066-890987f18a86?q=80&w=1400&auto=format&fit=crop',
  Office: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=1400&auto=format&fit=crop',
  Wellness: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1400&auto=format&fit=crop'
};

type Stage = 'primary' | 'category' | 'placeholder';

/** Extracts direct image URL from Google Image search links if present */
function sanitizeImageUrl(url: string): string {
  if (!url) return '';
  
  // Check for known broken Unsplash IDs directly in the string
  for (const [brokenKey, replacement] of Object.entries(BROKEN_IMAGE_REPLACEMENTS)) {
    if (url.includes(brokenKey)) return replacement;
  }

  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'www.google.com' && parsed.pathname === '/imgres') {
      const imgUrl = parsed.searchParams.get('imgurl');
      if (imgUrl) return decodeURIComponent(imgUrl);
    }
  } catch {
    // Fallback to original URL if not a valid absolute URL
  }
  return url;
}

export function ProductImage({ src, alt, category, onError, onLoad, ...props }: ProductImageProps) {
  const [stage, setStage] = useState<Stage>('primary');
  const [currentSrc, setCurrentSrc] = useState(() => sanitizeImageUrl(src));

  useEffect(() => {
    setStage('primary');
    setCurrentSrc(sanitizeImageUrl(src));
  }, [src]);

  return (
    <Image
      {...props}
      src={currentSrc || PLACEHOLDER_SRC}
      alt={alt}
      onLoad={onLoad}
      onError={(event) => {
        // Queue the state change to avoid "Cannot update a component while rendering another"
        // if onError is triggered synchronously during hydration or render.
        setTimeout(() => {
          if (stage === 'primary') {
            const categoryFallback = category ? CATEGORY_FALLBACK[category] : undefined;
            if (categoryFallback && categoryFallback !== src) {
              setStage('category');
              setCurrentSrc(categoryFallback);
            } else {
              setStage('placeholder');
              setCurrentSrc(PLACEHOLDER_SRC);
            }
          } else if (stage === 'category') {
            setStage('placeholder');
            setCurrentSrc(PLACEHOLDER_SRC);
          }
        }, 0);
        onError?.(event);
      }}
    />
  );
}
