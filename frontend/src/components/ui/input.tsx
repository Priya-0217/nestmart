import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'focus-ring h-11 w-full rounded-xl border border-border bg-white px-3 text-sm text-foreground placeholder:text-foreground/45 disabled:cursor-not-allowed disabled:bg-muted',
        className
      )}
      {...props}
    />
  );
});
