'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type ProductGalleryProps = {
  images: string[];
  name: string;
};

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div className="space-y-3">
      <div className="surface relative aspect-square overflow-hidden rounded-2xl">
        <Image src={activeImage} alt={name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {images.map((image) => (
          <button
            key={image}
            className={cn(
              'focus-ring relative aspect-square overflow-hidden rounded-xl border-2 transition',
              image === activeImage ? 'border-primary' : 'border-transparent'
            )}
            onClick={() => setActiveImage(image)}
          >
            <Image src={image} alt={`${name} thumbnail`} fill className="object-cover" sizes="20vw" />
          </button>
        ))}
      </div>
    </div>
  );
}
