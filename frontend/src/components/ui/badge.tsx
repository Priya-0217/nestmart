import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BadgeTone = 'default' | 'success' | 'warning' | 'muted';

const toneClasses: Record<BadgeTone, string> = {
  default: 'bg-primary/12 text-primary',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  muted: 'bg-muted text-foreground/70'
};

export function Badge({ children, tone = 'default', className }: { children: ReactNode; tone?: BadgeTone; className?: string }) {
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', toneClasses[tone], className)}>{children}</span>;
}
