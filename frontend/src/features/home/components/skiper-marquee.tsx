'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

type SkiperMarqueeItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  image: string;
  tag?: string;
};

type SkiperMarqueeProps = {
  items: SkiperMarqueeItem[];
  className?: string;
  ariaLabel?: string;
};

export function SkiperMarquee({ items, className, ariaLabel = 'Highlights' }: SkiperMarqueeProps) {
  const reduceMotion = useReducedMotion();

  if (items.length === 0) {
    return null;
  }

  const trackItems = [...items, ...items, ...items];
  const marqueeStyle = {
    '--skiper-marquee-duration': reduceMotion ? '0s' : '42s'
  } as CSSProperties;

  return (
    <section
      className={cn('skiper-marquee relative', className)}
      style={marqueeStyle}
      data-reduce={reduceMotion ? 'true' : undefined}
      aria-label={ariaLabel}
    >
      <div className="skiper-marquee-scroll">
        <div className="skiper-marquee-track">
          {trackItems.map((item, index) => (
            <Link key={`${item.id}-${index}`} href={item.href} className="skiper-marquee-card">
              <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-border bg-muted">
                <Image src={item.image} alt={item.title} fill className="object-cover" sizes="56px" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="text-xs text-foreground/60">{item.subtitle}</p>
              </div>
              {item.tag ? <span className="skiper-marquee-pill">{item.tag}</span> : null}
            </Link>
          ))}
        </div>
      </div>
      <div aria-hidden className="skiper-marquee-fade-left" />
      <div aria-hidden className="skiper-marquee-fade-right" />
    </section>
  );
}
