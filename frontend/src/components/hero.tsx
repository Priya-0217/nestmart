'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-mesh p-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="max-w-2xl space-y-5"
      >
        <p className="inline-flex rounded-full border border-trust/20 bg-white/70 px-3 py-1 text-xs font-semibold text-trust">
          Milestone 2 • UI/UX + Frontend Ready
        </p>
        <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
          Build your <span className="gradient-text">dream home</span> with animated shopping joy.
        </h1>
        <p className="text-lg text-slate-600">
          Pixel-perfect Next.js storefront with delightful motion, responsive components, and scalable architecture.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/products" className="rounded-full bg-trust px-6 py-3 font-semibold text-white shadow-glow">
            Explore Products
          </Link>
          <Link href="/account" className="rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700">
            Go to Account
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
