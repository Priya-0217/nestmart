import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary/90 hover:shadow-glow',
  secondary: 'bg-secondary text-foreground hover:bg-secondary/90 hover:shadow-glow',
  ghost: 'bg-transparent text-foreground hover:bg-muted',
  outline: 'border border-border bg-card text-foreground hover:bg-muted',
  danger: 'bg-rose-600 text-white hover:bg-rose-700'
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-11 min-w-[44px] px-3 text-sm',
  md: 'h-11 min-w-[44px] px-4 text-sm',
  lg: 'h-12 min-w-[44px] px-6 text-base'
};

export function Button({ className, variant = 'primary', size = 'md', type = 'button', children, ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'button-interactive group focus-ring inline-flex items-center justify-center rounded-full font-semibold transition-all duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-55',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
