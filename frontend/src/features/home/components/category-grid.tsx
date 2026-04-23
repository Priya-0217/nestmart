'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Category } from '@/lib/types';
import { FadeIn } from '@/components/motion/fade-in';
import { TRANSITION_STANDARD } from '@/lib/motion';

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-2 pr-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pr-0 xl:grid-cols-4">
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
    </div>
  );
}
