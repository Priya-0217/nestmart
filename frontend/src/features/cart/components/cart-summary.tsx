import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type CartSummaryProps = {
  subtotal: number;
  shipping: number;
  tax: number;
};

export function CartSummary({ subtotal, shipping, tax }: CartSummaryProps) {
  const total = subtotal + shipping + tax;

  return (
    <aside className="surface h-fit space-y-4 p-5">
      <h2 className="text-lg font-semibold">Order Summary</h2>
      <div className="space-y-1.5 text-sm text-foreground/75">
        <SummaryRow label="Subtotal" value={formatPrice(subtotal)} />
        <SummaryRow label="Shipping" value={formatPrice(shipping)} />
        <SummaryRow label="Tax" value={formatPrice(tax)} />
        <SummaryRow label="Total" value={formatPrice(total)} strong />
      </div>
      <Link href="/checkout" className="block">
        <Button size="lg" className="w-full">
          Continue to Checkout
        </Button>
      </Link>
    </aside>
  );
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <p className={`flex items-center justify-between ${strong ? 'border-t border-border pt-2 font-semibold text-foreground' : ''}`}>
      <span>{label}</span>
      <span>{value}</span>
    </p>
  );
}
