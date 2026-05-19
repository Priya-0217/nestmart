'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type RatingInputProps = {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  className?: string;
};

export function RatingInput({ value, onChange, max = 5, className }: RatingInputProps) {
  const [hover, setHover] = useState(0);

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: max }).map((_, index) => {
        const starValue = index + 1;
        const isActive = starValue <= (hover || value);

        return (
          <button
            key={index}
            type="button"
            className="focus-ring rounded-full p-1 transition-transform hover:scale-110 active:scale-95"
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(starValue)}
          >
            <Star
              className={cn(
                'h-6 w-6 transition-colors',
                isActive ? 'fill-secondary text-secondary' : 'text-muted-foreground'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
