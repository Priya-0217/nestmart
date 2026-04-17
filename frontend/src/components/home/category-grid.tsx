'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Category } from '@/lib/types';
import { FadeIn } from '@/components/motion/fade-in';
import { TRANSITION_STANDARD } from '@/lib/motion';

export function CategoryGrid({ categories }: { categories: Category[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [dragLimit, setDragLimit] = useState(0);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) {
      return;
    }

    const updateLimits = () => {
      const limit = rail.scrollWidth - rail.clientWidth;
      setDragLimit(limit > 0 ? limit : 0);
    };

    updateLimits();
    window.addEventListener('resize', updateLimits);
    return () => window.removeEventListener('resize', updateLimits);
  }, [categories.length]);

  const canDrag = dragLimit > 0;

  return (
    <motion.div
      ref={railRef}
      drag={canDrag ? 'x' : false}
      dragConstraints={{ left: -dragLimit, right: 0 }}
      dragElastic={0.12}
      className="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pr-2 active:cursor-grabbing sm:grid sm:grid-cols-2 sm:overflow-visible sm:pr-0 xl:grid-cols-4"
      style={{ cursor: canDrag ? 'grab' : 'auto' }}
    >
      {categories.map((category, index) => (
        <FadeIn key={category.id} delay={index * 0.04} className="min-w-[220px] snap-start sm:min-w-0">
          <motion.article whileHover={{ y: -6 }} transition={TRANSITION_STANDARD} className="surface group overflow-hidden transition-all duration-300 ease-in-out">
            <Link href={category.href}>
              <div className="relative aspect-[4/3]">
                <Image src={category.image} alt={category.name} fill className="object-cover transition-all duration-500 ease-in-out group-hover:scale-105" sizes="(max-width: 768px) 100vw, 25vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent transition-all duration-300 ease-in-out group-hover:from-black/60" />
                <div className="absolute bottom-3 left-3 text-white transition-all duration-300 ease-in-out group-hover:-translate-y-1">
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                  <p className="text-xs text-white/90">{category.count} products</p>
                </div>
              </div>
            </Link>
          </motion.article>
        </FadeIn>
      ))}
    </motion.div>
  );
}
