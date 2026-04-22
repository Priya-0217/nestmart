import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
};

export function SectionHeading({ title, subtitle, action, className }: SectionHeadingProps) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-3', className)}>
      <div>
        <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">{title}</h2>
        <span aria-hidden="true" className="mt-2 block h-0.5 w-10 rounded-full bg-gradient-to-r from-primary to-secondary" />
        {subtitle ? <p className="mt-2 text-sm text-foreground/65">{subtitle}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
