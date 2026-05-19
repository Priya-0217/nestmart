import { ProductVariant } from '@/lib/types';
import { cn } from '@/lib/utils';

type VariantPickerProps = {
  variants: ProductVariant[];
  activeVariantId: string;
  onChange: (variantId: string) => void;
};

export function VariantPicker({ variants, activeVariantId, onChange }: VariantPickerProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-foreground">Choose Variant</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {variants.map((variant) => {
          const selected = variant.id === activeVariantId;
          return (
            <button
              key={variant.id}
              className={cn(
                'focus-ring flex items-center justify-between rounded-xl border px-4 py-3 text-left transition',
                selected ? 'border-primary ring-1 ring-primary bg-primary/[0.03]' : 'border-border bg-card hover:bg-muted/50'
              )}
              onClick={() => onChange(variant.id)}
            >
              <span>
                <span className="block text-sm font-bold text-foreground">{variant.name}</span>
                <span className="block text-[11px] uppercase tracking-wider text-foreground/50">{variant.size} • {variant.sku}</span>
              </span>
              <span className="inline-flex items-center gap-2 text-xs font-medium text-foreground/70">
                <span className={cn("h-2 w-2 rounded-full", variant.stock > 0 ? "bg-emerald-500" : "bg-red-500")} />
                {variant.stock} left
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
