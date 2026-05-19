import type { CSSProperties } from 'react';
import { Testimonial } from '@/lib/types';
import { RatingStars } from '@/components/ui/rating-stars';
import { cn } from '@/lib/utils';

type ReviewMarqueeProps = {
  testimonials: Testimonial[];
  className?: string;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('');
}

export function ReviewMarquee({ testimonials, className }: ReviewMarqueeProps) {
  // Repeat the items several times to ensure the track is always wider than the viewport 
  // and the animation from 0 to -16.66% is seamless on all screen sizes.
  const trackItems = [
    ...testimonials,
    ...testimonials,
    ...testimonials,
    ...testimonials,
    ...testimonials,
    ...testimonials
  ];

  if (testimonials.length === 0) {
    return null;
  }

  const marqueeStyle = {
    '--marquee-duration': '50s'
  } as CSSProperties;

  return (
    <div className={cn('review-marquee relative', className)} style={marqueeStyle}>
      <div className="review-marquee-scroll flex w-full overflow-hidden px-4 sm:px-6">
        <div className="review-marquee-track">
          {trackItems.map((testimonial, index) => (
            <article key={`${testimonial.id}-${index}`} className="review-card">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {getInitials(testimonial.name)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-xs text-foreground/55">{testimonial.role}</p>
                </div>
              </div>
              <div className="mt-3">
                <RatingStars rating={testimonial.rating} />
              </div>
              <p className="mt-3 text-sm text-foreground/75">“{testimonial.quote}”</p>
            </article>
          ))}
        </div>
      </div>
      <div aria-hidden className="review-marquee-fade-left" />
      <div aria-hidden className="review-marquee-fade-right" />
    </div>
  );
}
