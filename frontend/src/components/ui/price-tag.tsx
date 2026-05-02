import { formatPrice } from '@/lib/utils';

type PriceTagProps = {
  price: number;
  compareAtPrice?: number;
  className?: string;
};

export function PriceTag({ price, compareAtPrice, className }: PriceTagProps) {
  return (
    <p className={className}>
      <span className="text-lg font-semibold text-foreground">{formatPrice(price)}</span>
      {compareAtPrice && compareAtPrice > price ? <span className="ml-2 text-sm text-foreground/45 line-through">{formatPrice(compareAtPrice)}</span> : null}
    </p>
  );
}
