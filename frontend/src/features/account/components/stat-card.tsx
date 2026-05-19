import { ReactNode } from 'react';

export function StatCard({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <article className="surface flex items-center justify-between gap-3 p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
      </div>
      {icon ? (
        <div className="rounded-2xl border border-primary/20 bg-primary/10 p-2.5 text-primary">
          {icon}
        </div>
      ) : null}
    </article>
  );
}
