import { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  description?: string;
};

export function Checkbox({ label, description, className, ...props }: CheckboxProps) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5">
      <input type="checkbox" className={cn('focus-ring mt-0.5 h-4 w-4 rounded border-border text-primary', className)} {...props} />
      <span className="space-y-0.5">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {description ? <span className="block text-xs text-foreground/60">{description}</span> : null}
      </span>
    </label>
  );
}
