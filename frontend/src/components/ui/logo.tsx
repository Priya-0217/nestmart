import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt="NestMart Logo - Lamp Medallion"
      className={cn('object-contain drop-shadow-sm', className)}
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
}