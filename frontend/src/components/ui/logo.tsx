import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="NestMart logo"
      className={cn('h-9 w-9', className)}
    >
      <defs>
        <linearGradient id="goldGradient" x1="10" y1="10" x2="190" y2="190" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D4AF37" />
          <stop offset="0.5" stopColor="#FFD700" />
          <stop offset="1" stopColor="#D4AF37" />
        </linearGradient>
      </defs>

      <circle cx="100" cy="100" r="90" fill="url(#goldGradient)" />
      <path d="M100 30 L160 80 V170 H40 V80 L100 30 Z" fill="#2C3E50" />
      <circle cx="100" cy="100" r="20" fill="#2C3E50" />
      <rect x="95" y="110" width="10" height="40" fill="#2C3E50" />

      <rect x="55" y="130" width="30" height="20" fill="#FFFFFF" opacity="0.8" />
      <rect x="55" y="125" width="30" height="5" fill="#FFFFFF" opacity="0.8" />

      <rect x="115" y="130" width="30" height="5" fill="#FFFFFF" opacity="0.8" />
      <rect x="120" y="135" width="5" height="15" fill="#FFFFFF" opacity="0.8" />
      <rect x="135" y="135" width="5" height="15" fill="#FFFFFF" opacity="0.8" />
    </svg>
  );
}
