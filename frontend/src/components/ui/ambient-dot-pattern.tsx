import { ReactNode } from 'react';
import { DotPattern } from '@/components/magicui/dot-pattern';
import { cn } from '@/lib/utils';

type AmbientDotPatternProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  patternClassName?: string;
};

export function AmbientDotPattern({
  children,
  className,
  contentClassName,
  patternClassName
}: AmbientDotPatternProps) {
  return (
    <section className={cn('relative isolate overflow-hidden', className)}>
      <DotPattern
        width={24}
        height={24}
        cx={1}
        cy={1}
        cr={1}
        className={cn(
          '-z-10 hidden text-neutral-400/30 dark:block [mask-image:radial-gradient(ellipse_at_center,black_28%,transparent_82%)]',
          patternClassName
        )}
      />
      <div className={cn('relative z-10', contentClassName)}>{children}</div>
    </section>
  );
}
