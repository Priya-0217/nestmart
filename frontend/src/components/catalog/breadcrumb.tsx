import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-foreground/60">
      {items.map((item, index) => {
        const last = index === items.length - 1;
        return (
          <span key={item.label + index} className="inline-flex items-center gap-1">
            {item.href && !last ? <Link href={item.href} className="hover:text-foreground">{item.label}</Link> : <span className={last ? 'text-foreground/85' : ''}>{item.label}</span>}
            {!last ? <ChevronRight className="h-4 w-4" /> : null}
          </span>
        );
      })}
    </nav>
  );
}
