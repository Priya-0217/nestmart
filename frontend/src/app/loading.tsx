export default function Loading() {
  return (
    <div className="space-y-10">
      <section className="surface overflow-hidden p-1">
        <div className="h-[420px] rounded-[1rem] bg-[#f0ebe3] md:h-[520px] animate-pulse" />
      </section>

      <section className="space-y-4">
        <div className="h-6 w-56 rounded-full bg-muted/70 animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`cat-${index}`} className="h-36 rounded-2xl bg-muted/70 animate-pulse" />
          ))}
        </div>
      </section>

      <div className="h-14 rounded-2xl bg-muted/60 animate-pulse" />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={`prod-${index}`} className="h-72 rounded-2xl bg-muted/70 animate-pulse" />
        ))}
      </section>
    </div>
  );
}
