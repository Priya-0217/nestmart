import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type CheckoutSectionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function CheckoutSectionCard({ title, description, children, className }: CheckoutSectionCardProps) {
  return (
    <section className={cn('surface space-y-4 p-5 sm:p-6', className)}>
      <header>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description ? <p className="mt-1 text-sm text-foreground/65">{description}</p> : null}
      </header>
      {children}
    </section>
  );
}
