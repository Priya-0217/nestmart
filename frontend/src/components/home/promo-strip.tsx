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
      className="rounded-3xl bg-primary px-5 py-6 text-white sm:px-8"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-secondary">Flash Event</p>
          <h2 className="mt-1 text-2xl font-semibold md:text-3xl">Save 25% on curated bundles.</h2>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
          <TimerChip label="Days" value={days} />
          <TimerChip label="Hours" value={hours} />
          <TimerChip label="Mins" value={mins} />
          <TimerChip label="Secs" value={seconds} />
        </div>
        <Link href="/products">
          <Button variant="secondary">Shop Deals</Button>
        </Link>
      </div>
    </motion.section>
  );
}

function TimerChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/15 px-3 py-2">
      <AnimatePresence mode="popLayout">
        <motion.p
          key={value}
          className="text-xl font-semibold"
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={TRANSITION_FAST}
        >
          {String(value).padStart(2, '0')}
        </motion.p>
      </AnimatePresence>
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/85">{label}</p>
    </div>
  );
}
