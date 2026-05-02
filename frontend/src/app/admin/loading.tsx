export default function Loading() {
  return (
    <div className="min-h-dvh bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 lg:flex-row">
        <div className="hidden h-[calc(100dvh-4rem)] w-72 shrink-0 rounded-3xl border border-border bg-card/70 p-4 shadow-sm lg:block" />
        <div className="flex-1 space-y-6">
          <div className="h-20 rounded-3xl border border-border bg-card/70" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-28 rounded-3xl border border-border bg-card/70" />
            ))}
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="h-80 rounded-3xl border border-border bg-card/70" />
            <div className="h-80 rounded-3xl border border-border bg-card/70" />
          </div>
          <div className="grid gap-6 xl:grid-cols-[1.6fr,0.9fr]">
            <div className="h-[26rem] rounded-3xl border border-border bg-card/70" />
            <div className="h-[26rem] rounded-3xl border border-border bg-card/70" />
          </div>
        </div>
      </div>
    </div>
  );
}