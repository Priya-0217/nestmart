import Link from 'next/link';
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

type EmptyStateProps = {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  icon?: ReactNode;
};

export function EmptyState({ title, description, ctaLabel, ctaHref = '/products', icon }: EmptyStateProps) {
  return (
    <div className="surface flex flex-col items-center justify-center px-6 py-12 text-center">
      {icon ? <div className="mb-3 text-primary">{icon}</div> : null}
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-foreground/65">{description}</p>
      {ctaLabel ? (
        <Link href={ctaHref} className="mt-5">
          <Button>{ctaLabel}</Button>
        </Link>
      ) : null}
    </div>
  );
}
