import { formatPrice } from '@/lib/utils';

type ReviewLine = {
  label: string;
  value: string;
};

type OrderReviewProps = {
  lines: ReviewLine[];
  subtotal: number;
  shipping: number;
  tax: number;
};

export function OrderReview({ lines, subtotal, shipping, tax }: OrderReviewProps) {
  const total = subtotal + shipping + tax;
  return (
    <div className="space-y-3">
      <div className="space-y-1 text-sm text-foreground/75">
        {lines.map((line) => (
          <p key={line.label} className="flex justify-between gap-2">
            <span>{line.label}</span>
            <span className="text-right">{line.value}</span>
          </p>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-muted/50 p-3 text-sm">
        <p className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </p>
        <p className="mt-1 flex justify-between">
          <span>Shipping</span>
          <span>{formatPrice(shipping)}</span>
        </p>
        <p className="mt-1 flex justify-between">
          <span>Tax</span>
          <span>{formatPrice(tax)}</span>
        </p>
        <p className="mt-2 flex justify-between border-t border-border pt-2 font-semibold text-foreground">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </p>
      </div>
    </div>
  );
}
