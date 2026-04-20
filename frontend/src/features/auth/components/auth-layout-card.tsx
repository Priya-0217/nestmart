import { ReactNode } from 'react';

export function AuthLayoutCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="surface mx-auto w-full max-w-md p-6 sm:p-8">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-1 text-sm text-foreground/65">{subtitle}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}
