import { Minus, Plus } from 'lucide-react';
import { clamp, cn } from '@/lib/utils';

type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
};

export function QuantityStepper({ value, onChange, min = 1, max = 99, className }: QuantityStepperProps) {
  return (
    <div className={cn('inline-flex items-center rounded-full border border-border bg-white', className)}>
      <button
        className="focus-ring rounded-full p-2 text-foreground/70 hover:bg-muted"
        aria-label="Decrease quantity"
        onClick={() => onChange(clamp(value - 1, min, max))}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-9 text-center text-sm font-semibold">{value}</span>
      <button
        className="focus-ring rounded-full p-2 text-foreground/70 hover:bg-muted"
        aria-label="Increase quantity"
        onClick={() => onChange(clamp(value + 1, min, max))}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
