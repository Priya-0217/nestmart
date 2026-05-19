'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductImage } from '@/components/ui/product-image';

type ProductGalleryProps = {
  images: Array<string | { type?: 'image' | 'video'; url: string; thumbnail?: string }>;
  name: string;
  category?: string;
};

export function ProductGallery({ images, name, category }: ProductGalleryProps) {
  const media = useMemo(
    () =>
      images.map((item) => {
        if (typeof item === 'string') {
          const lower = item.toLowerCase();
          const isVideo = lower.endsWith('.mp4') || lower.includes('video');
          return { type: isVideo ? 'video' : 'image', url: item, thumbnail: item };
        }
        return {
          type: item.type ?? 'image',
          url: item.url,
          thumbnail: item.thumbnail ?? item.url
        };
      }),
    [images]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  const activeItem = media[activeIndex] ?? media[0];

  function go(delta: number) {
    if (media.length <= 1) return;
    setActiveIndex((current) => (current + delta + media.length) % media.length);
  }

  return (
    <div className="lg:sticky lg:top-24">
      <div className="grid gap-4 lg:grid-cols-[88px_minmax(0,1fr)] lg:items-start">
        <div className="order-2 flex gap-3 overflow-x-auto pb-1 lg:order-1 lg:h-[640px] lg:flex-col lg:overflow-y-auto lg:overflow-x-visible lg:pr-1">
          {media.map((item, index) => (
            <button
              key={`${item.url}-${index}`}
              className={cn(
                'focus-ring relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-2xl border-2 bg-white transition-all duration-300 lg:w-full',
                index === activeIndex ? 'border-primary shadow-[0_10px_24px_-18px_rgba(26,86,219,0.75)]' : 'border-border hover:border-primary/40'
              )}
              onClick={() => setActiveIndex(index)}
              aria-label={`View ${item.type === 'video' ? 'video' : 'image'} ${index + 1}`}
            >
              {item.type === 'video' ? (
                <div className="relative h-full w-full bg-foreground text-white">
                  <ProductImage src={item.thumbnail ?? item.url} alt={`${name} video thumbnail`} category={category} fill className="object-cover opacity-70" sizes="88px" />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold tracking-[0.2em]">VIDEO</span>
                </div>
              ) : (
                <ProductImage src={item.thumbnail ?? item.url} alt={`${name} thumbnail`} category={category} fill className="object-cover" sizes="88px" />
              )}
            </button>
          ))}
        </div>

        <div
          className="surface order-1 relative isolate overflow-hidden rounded-[28px] bg-white shadow-sm lg:order-2"
          onMouseEnter={() => setZoomed(true)}
          onMouseLeave={() => setZoomed(false)}
          onTouchStart={(event) => {
            const x = event.touches[0]?.clientX ?? 0;
            (event.currentTarget as HTMLDivElement).dataset.startX = String(x);
          }}
          onTouchEnd={(event) => {
            const startX = Number((event.currentTarget as HTMLDivElement).dataset.startX ?? '0');
            const endX = event.changedTouches[0]?.clientX ?? startX;
            const delta = endX - startX;
            if (Math.abs(delta) > 40) {
              go(delta > 0 ? -1 : 1);
            }
          }}
        >
          <div className="relative aspect-[4/5] min-h-[420px] overflow-hidden bg-bgSoft sm:aspect-[5/6] lg:min-h-[640px]">
            {activeItem?.type === 'video' ? (
              <video src={activeItem.url} controls className="h-full w-full object-cover" />
            ) : (
              <ProductImage
                src={activeItem?.url ?? '/product-placeholder.svg'}
                alt={name}
                category={category}
                fill
                className={cn('object-cover transition-transform duration-500 ease-out', zoomed ? 'scale-[1.14]' : 'scale-100')}
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />

            {media.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="focus-ring absolute left-4 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-primary shadow-sm backdrop-blur transition hover:bg-white"
                  aria-label="Previous media"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="focus-ring absolute right-4 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-primary shadow-sm backdrop-blur transition hover:bg-white"
                  aria-label="Next media"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            ) : null}

            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <button
                type="button"
                className="focus-ring inline-flex h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                onClick={() => setLightbox(true)}
                aria-label="Open 360 degree view"
              >
                <RotateCw className="h-4 w-4" />
                <span>360°</span>
              </button>
            </div>

            <button
              type="button"
              className="focus-ring absolute bottom-4 right-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-primary shadow-sm backdrop-blur transition hover:bg-white"
              onClick={() => setLightbox(true)}
              aria-label="Open fullscreen media"
            >
              <Expand className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {lightbox ? (
        <div className="fixed inset-0 z-[200] bg-black/85 p-4 backdrop-blur" role="dialog" aria-modal="true">
          <button
            type="button"
            className="focus-ring absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-white"
            onClick={() => setLightbox(false)}
          >
            Close
          </button>
          <div className="mx-auto flex h-full w-full max-w-5xl items-center justify-center">
            {activeItem?.type === 'video' ? (
              <video src={activeItem.url} controls autoPlay className="max-h-full max-w-full rounded-2xl" />
            ) : (
              <img src={activeItem?.url} alt={name} className="max-h-full max-w-full rounded-2xl object-contain" />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
