import { cn } from '@/lib/utils';

export type RadioOption = {
  value: string;
  label: string;
  description?: string;
};

type RadioGroupProps = {
  name: string;
  value: string;
  options: RadioOption[];
  onChange: (value: string) => void;
  className?: string;
};

export function RadioGroup({ name, value, options, onChange, className }: RadioGroupProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {options.map((option) => (
        <label key={option.value} className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-border px-3 py-2.5 transition hover:bg-muted/80">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="focus-ring mt-0.5 h-4 w-4 border-border text-primary"
          />
          <span>
            <span className="block text-sm font-medium text-foreground">{option.label}</span>
            {option.description ? <span className="block text-xs text-foreground/60">{option.description}</span> : null}
          </span>
        </label>
      ))}
    </div>
  );
}
