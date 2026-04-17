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
                'focus-ring flex items-center justify-between rounded-xl border px-3 py-2 text-left transition',
                selected ? 'border-primary bg-primary/5' : 'border-border bg-white hover:bg-muted'
              )}
              onClick={() => onChange(variant.id)}
            >
              <span>
                <span className="block text-sm font-medium">{variant.name}</span>
                <span className="block text-xs text-foreground/55">{variant.size} • {variant.sku}</span>
              </span>
              <span className="inline-flex items-center gap-2 text-xs text-foreground/70">
                <span className="inline-flex h-4 w-4 rounded-full border border-border" style={{ backgroundColor: variant.colorHex }} />
                {variant.stock} left
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
