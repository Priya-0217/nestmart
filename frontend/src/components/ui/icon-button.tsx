import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  label: string;
};

export function IconButton({ icon, label, className, ...props }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={cn('focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-foreground/70 hover:bg-muted', className)}
      {...props}
    >
      {icon}
    </button>
  );
}
