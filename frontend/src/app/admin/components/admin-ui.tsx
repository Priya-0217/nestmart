'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type HeaderAction = {
  key: string;
  node: ReactNode;
};

export function AdminPageHeader({
  title,
  subtitle,
  actions,
  chips
}: {
  title: string;
  subtitle: string;
  actions?: HeaderAction[];
  chips?: ReactNode;
}) {
  return (
    <Card className="border-border/70 bg-card/80 p-5 shadow-card sm:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.2em] text-foreground/45">NestMart Admin</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm text-foreground/65 leading-relaxed">{subtitle}</p>
          {chips ? <div className="mt-3 flex flex-wrap gap-2">{chips}</div> : null}
        </div>
        {actions?.length ? (
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {actions.map((action) => (
              <div key={action.key}>{action.node}</div>
            ))}
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export function AdminMotionCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <Card className={cn('border-border/70 bg-card/92 shadow-card', className)}>{children}</Card>
    </motion.div>
  );
}

export function AdminToolbar({
  search,
  onSearch,
  right
}: {
  search: string;
  onSearch: (value: string) => void;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/70 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs md:max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
        <Input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search by keyword..." className="pl-10" />
      </div>
      {right ? <div className="flex flex-wrap items-center gap-2">{right}</div> : null}
    </div>
  );
}
