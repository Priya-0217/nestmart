import { ReactNode } from 'react';

export function StatCard({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <article className="surface p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-foreground/65">{label}</p>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </article>
  );
}
