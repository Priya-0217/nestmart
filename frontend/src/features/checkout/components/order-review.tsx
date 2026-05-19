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
  discount?: number;
};

export function OrderReview({ lines, subtotal, shipping, tax, discount = 0 }: OrderReviewProps) {
  const total = subtotal + shipping + tax - discount;
  
  // Separate contact/shipping info from items
  const infoLines = lines.filter(l => !l.label.includes('x '));
  const itemLines = lines.filter(l => l.label.includes('x '));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {infoLines.map((line) => (
          <div key={line.label} className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground/50">
              {line.label}
            </span>
            <p className="text-sm font-medium text-foreground">{line.value}</p>
          </div>
        ))}
      </div>

      {itemLines.length > 0 && (
        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground/50">
            Order Items
          </span>
          <div className="space-y-2">
            {itemLines.map((line) => (
              <div key={line.label} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0">
                <span className="text-foreground/80">{line.label}</span>
                <span className="font-medium">{line.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-muted/30 p-5 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-foreground/60">Subtotal</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-foreground/60">Shipping</span>
          <span className="font-medium">{formatPrice(shipping)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-foreground/60">Tax</span>
          <span className="font-medium">{formatPrice(tax)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span className="font-medium">Discount</span>
            <span className="font-semibold">-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="pt-3 mt-3 border-t border-border flex justify-between items-center">
          <span className="text-base font-bold text-foreground">Total</span>
          <span className="text-xl font-bold text-primary">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
