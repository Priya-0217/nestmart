import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt="NestMart Logo - Lamp Medallion"
      className={cn('h-20 w-20 flex-shrink-0 object-contain drop-shadow-sm', className)}
    />
  );
}