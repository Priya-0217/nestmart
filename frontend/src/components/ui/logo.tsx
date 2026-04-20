import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        viewBox="0 0 60 60"
        xmlns="http://www.w3.org/2000/svg"
        className="h-9 w-9"
      >
        {/* Icon mark: shopping basket with a roof/nest motif */}
        <g transform="translate(0,0)">
          {/* Basket */}
          <rect x="10" y="25" width="40" height="30" rx="6" fill="#1A56DB" />

          {/* Basket lines */}
          <line x1="20" y1="25" x2="20" y2="55" stroke="white" stroke-width="2" />
          <line x1="30" y1="25" x2="30" y2="55" stroke="white" stroke-width="2" />
          <line x1="40" y1="25" x2="40" y2="55" stroke="white" stroke-width="2" />

          {/* Roof motif */}
          <polygon points="5,25 30,5 55,25" fill="#F59E0B" />
        </g>
      </svg>
      <span className="font-display text-xl font-bold tracking-tight text-foreground">
        Nest<span className="text-primary">Mart</span>
      </span>
    </div>
  );
}
