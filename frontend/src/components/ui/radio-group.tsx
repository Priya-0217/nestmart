import { cn } from '@/lib/utils';

export type RadioOption = {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
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
    <div className={cn('grid gap-3', className)}>
      {options.map((option) => (
        <label 
          key={option.value} 
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all duration-200",
            value === option.value 
              ? "border-primary bg-primary/[0.03] ring-1 ring-primary shadow-sm" 
              : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          <div className="flex h-5 items-center">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="h-4 w-4 border-border text-primary focus:ring-primary focus:ring-offset-0"
            />
          </div>
          <div className="flex flex-1 items-start gap-3">
            {option.icon && (
              <div className={cn(
                "mt-0.5 rounded-lg p-2",
                value === option.value ? "bg-primary/10 text-primary" : "bg-muted text-foreground/60"
              )}>
                {option.icon}
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              <span className={cn(
                "text-sm font-semibold",
                value === option.value ? "text-primary" : "text-foreground"
              )}>
                {option.label}
              </span>
              {option.description && (
                <span className="text-xs text-foreground/60 leading-normal">
                  {option.description}
                </span>
              )}
            </div>
          </div>
        </label>
      ))}
    </div>
  );
}
