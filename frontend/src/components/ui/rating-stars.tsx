import { Star } from 'lucide-react';

type RatingStarsProps = {
  rating: number;
  reviewCount?: number;
};

export function RatingStars({ rating, reviewCount }: RatingStarsProps) {
  const fullStars = Math.round(rating);

  return (
    <div className="flex items-center gap-1.5 text-sm text-foreground/70">
      <div className="flex items-center gap-0.5 text-secondary">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} className={`h-3.5 w-3.5 ${index < fullStars ? 'fill-current' : ''}`} />
        ))}
      </div>
      <span>{rating.toFixed(1)}</span>
      {reviewCount ? <span>({reviewCount})</span> : null}
    </div>
  );
}
