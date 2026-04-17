import { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'focus-ring min-h-28 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/45 disabled:cursor-not-allowed disabled:bg-muted',
        className
      )}
      {...props}
    />
  );
}
