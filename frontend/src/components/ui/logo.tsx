import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="NestMart Logo - Lamp Medallion"
      width={96}
      height={96}
      priority
      className={cn('object-contain drop-shadow-sm', className)}
    />
  );
}