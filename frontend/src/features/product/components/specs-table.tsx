export function SpecsTable({ specs }: { specs: Record<string, string> }) {
  const entries = Object.entries(specs);
  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="surface p-5">
      <h2 className="text-lg font-semibold">Specifications</h2>
      <dl className="mt-3 grid gap-2 sm:grid-cols-2">
        {entries.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border px-3 py-2">
            <dt className="text-xs uppercase tracking-wide text-foreground/55">{label}</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
