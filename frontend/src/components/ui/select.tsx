import { SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'focus-ring h-11 w-full rounded-xl border border-border bg-white px-3 text-sm text-foreground disabled:cursor-not-allowed disabled:bg-muted',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
