interface PageTemplateProps {
  title: string;
  description: string;
}

export function PageTemplate({ title, description }: PageTemplateProps) {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-6xl flex-col gap-4 px-4 py-12 md:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">NestMart Scaffold</p>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">{title}</h1>
      <p className="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">{description}</p>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
        Detailed implementation for this page is queued and will be built section-by-section.
      </div>
    </main>
  );
}
