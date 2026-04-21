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
      className="rounded-2xl bg-primary/90 px-3 py-3 text-white sm:px-8 w-full max-w-none mx-0"
    >
      <div className="flex flex-col items-center justify-center gap-3 sm:gap-5">
        <div className="text-center w-full">
          <p className="text-xs uppercase tracking-[0.2em] text-secondary">Flash Event</p>
          <h2 className="mt-1 text-xl font-semibold md:text-3xl">Save 25% on curated bundles.</h2>
        </div>
        <div className="grid grid-cols-4 gap-1 text-center w-full max-w-xs mx-auto">
          <TimerChip label="Days" value={days} />
          <TimerChip label="Hours" value={hours} />
          <TimerChip label="Mins" value={mins} />
          <TimerChip label="Secs" value={seconds} />
        </div>
        <Link href="/products">
          <Button variant="secondary" className="py-1 px-4 text-sm">Shop Deals</Button>
        </Link>
      </div>
    </motion.section>
  );
}

function TimerChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-white/10 px-2 py-1 sm:px-3 sm:py-2 flex flex-col items-center">
      <AnimatePresence mode="popLayout">
        <motion.p
          key={value}
          className="text-base font-semibold sm:text-xl"
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={TRANSITION_FAST}
        >
          {String(value).padStart(2, '0')}
        </motion.p>
      </AnimatePresence>
      <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-white/85">{label}</p>
    </div>
  );
}
