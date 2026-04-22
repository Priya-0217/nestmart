function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-muted/70 ${className}`} />;
}

export default function Loading() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero */}
      <Pulse className="h-[280px] sm:h-[380px] md:h-[480px] rounded-[1.5rem]" />

      {/* Featured Categories */}
      <section className="space-y-3">
        <div className="flex flex-col gap-1">
          <Pulse className="h-5 w-44 rounded-full" />
          <Pulse className="h-3.5 w-64 rounded-full bg-muted/50" />
        </div>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Pulse key={i} className="aspect-[4/3]" />
          ))}
        </div>
      </section>

      {/* Marquee strip */}
      <Pulse className="h-16 rounded-3xl" />

      {/* Promo strip */}
      <Pulse className="h-36 sm:h-28 rounded-2xl" />

      {/* Product shelf */}
      <section className="space-y-3">
        <Pulse className="h-5 w-48 rounded-full" />
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Pulse key={i} className="h-64 sm:h-72" />
          ))}
        </div>
      </section>

      {/* Collection strip */}
      <section className="space-y-3">
        <Pulse className="h-5 w-40 rounded-full" />
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Pulse key={i} className="h-64 sm:h-72" />
          ))}
        </div>
      </section>

      {/* Feature grid */}
      <section className="space-y-3">
        <Pulse className="h-5 w-36 rounded-full" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Pulse key={i} className="h-24" />
          ))}
        </div>
      </section>

      {/* Review marquee */}
      <Pulse className="h-36 rounded-3xl" />

      {/* Newsletter CTA */}
      <Pulse className="h-40 rounded-3xl" />
    </div>
  );
}
