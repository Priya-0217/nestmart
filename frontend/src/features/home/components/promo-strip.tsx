'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TRANSITION_FAST, TRANSITION_STANDARD } from '@/lib/motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function PromoStrip() {
  const endDate = useMemo(() => Date.now() + 4 * 24 * 60 * 60 * 1000, []);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const remaining = Math.max(endDate - now, 0);
  const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
  const hours = Math.floor((remaining / (60 * 60 * 1000)) % 24);
  const mins = Math.floor((remaining / (60 * 1000)) % 60);
  const seconds = Math.floor((remaining / 1000) % 60);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={TRANSITION_STANDARD}
      className="relative overflow-hidden rounded-2xl bg-primary px-6 py-8 text-white sm:px-10 w-full max-w-none mx-0"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_top_left,rgba(0,0,0,0.2),transparent_60%)]" />
      <div className="relative flex flex-col items-center gap-5 md:flex-row md:items-center md:justify-between">
        <div className="text-center md:text-left">
          <p className="text-xs uppercase tracking-[0.2em] text-secondary">Flash Event</p>
          <h2 className="mt-1 text-2xl font-bold md:text-4xl">Save 25% on curated bundles.</h2>
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="grid grid-cols-4 gap-2 text-center">
            <TimerChip label="Days" value={days} />
            <TimerChip label="Hours" value={hours} />
            <TimerChip label="Mins" value={mins} />
            <TimerChip label="Secs" value={seconds} />
          </div>
          <Link href="/products">
            <Button variant="secondary" size="lg">Shop Deals</Button>
          </Link>
        </div>
      </div>
    </motion.section>
  );
}

function TimerChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex min-w-[60px] flex-col items-center rounded-xl bg-black/20 px-3 py-2 ring-1 ring-black/30">
      <AnimatePresence mode="popLayout">
        <motion.p
          key={value}
          className="text-xl font-bold tabular-nums sm:text-2xl"
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={TRANSITION_FAST}
        >
          {String(value).padStart(2, '0')}
        </motion.p>
      </AnimatePresence>
      <p className="mt-0.5 text-[10px] uppercase tracking-widest text-white/70">{label}</p>
    </div>
  );
}
