'use client';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Replace with your actual product image URLs
const PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1574182245530-967d9b383f2a?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1519947486511-46149fa5db1e?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1519648023493-d82b5f8d7b8a?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200&h=200&fit=crop',
];

const COLS = [
  { dir: 'up', dur: 18, offset: 0 },
  { dir: 'down', dur: 22, offset: -50 },
  { dir: 'up', dur: 15, offset: 0 },
  { dir: 'down', dur: 19, offset: -50 },
];

const HEIGHTS = [120, 150, 110, 140, 130, 160, 115, 145];

function ImageTile({ src, alt, height }: { src: string; alt: string; height: number }) {
  return (
    <div style={{ position: 'relative', height, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
      <Image
        src={src}
        alt={alt}
        fill
        loading="lazy"
        sizes="200px"
        className="object-cover transition-all duration-700"
        style={{ filter: 'brightness(0.85) contrast(0.9)' }}
      />
    </div>
  );
}

function ScrollCol({
  colIndex,
  dir,
  dur,
  offset,
}: {
  colIndex: number;
  dir: string;
  dur: number;
  offset: number;
}) {
  const items = Array.from(
    { length: 8 },
    (_, i) => PRODUCT_IMAGES[(colIndex * 3 + i) % PRODUCT_IMAGES.length]
  );
  const doubled = [...items, ...items];
  const heights = Array.from({ length: doubled.length }, (_, i) => HEIGHTS[i % HEIGHTS.length]);

  const keyframes = dir === 'up' ? { y: ['0%', '-50%'] } : { y: ['-50%', '0%'] };

  return (
    <motion.div
      animate={keyframes}
      initial={{ y: `${offset}%` }}
      transition={{ duration: dur, repeat: Infinity, ease: 'linear' }}
      style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
    >
      {doubled.map((imgSrc, i) => (
        <ImageTile key={i} src={imgSrc} alt={`Product ${i}`} height={heights[i]} />
      ))}
    </motion.div>
  );
}

type PromoVideoTextProps = {
  headline?: string;
  subheadline?: string;
  className?: string;
  images?: string[];
};

export function PromoVideoText({
  headline = 'Your Home. Your Style. Your Mart.',
  subheadline = 'Curated collections designed for modern living',
  className,
  images,
}: PromoVideoTextProps) {
  const reduceMotion = useReducedMotion();
  const imageList = images || PRODUCT_IMAGES;

  const textVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.12, delayChildren: 0.1 } },
  };

  return (
    <section
      className={cn(
        'relative flex w-full items-center justify-center overflow-hidden rounded-3xl bg-neutral-900',
        'min-h-[320px] sm:min-h-[400px] md:min-h-[480px]',
        'dark:border dark:border-white/10 dark:bg-[#0f1117] dark:shadow-[0_24px_80px_rgba(0,0,0,0.45)]',
        className
      )}
    >
      <div className="absolute inset-0 grid grid-cols-4 gap-1 opacity-50 dark:opacity-60">
        {COLS.map((col, i) => (
          <div key={i} style={{ overflow: 'hidden' }}>
            <ScrollCol colIndex={i} {...col} />
          </div>
        ))}
      </div>

      <div
        className="pointer-events-none absolute inset-x-[8%] top-[-18%] hidden h-48 rounded-full bg-[radial-gradient(circle,_rgba(245,184,91,0.24)_0%,_rgba(245,184,91,0)_72%)] blur-3xl dark:block"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-[-22%] right-[-5%] hidden h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(124,165,212,0.22)_0%,_rgba(124,165,212,0)_72%)] blur-3xl dark:block"
        aria-hidden="true"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/30 to-black/40 dark:from-black/20 dark:via-black/10 dark:to-black/20" />
      <div
        className="absolute inset-0 dark:hidden"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)' }}
      />
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background:
            'radial-gradient(circle at 50% 44%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 26%, rgba(6,8,12,0.76) 100%)',
        }}
      />
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background:
            'linear-gradient(135deg, rgba(245,184,91,0.14) 0%, rgba(245,184,91,0) 32%, rgba(124,165,212,0) 62%, rgba(124,165,212,0.16) 100%)',
        }}
      />

      <motion.div
        className="relative z-10 px-6 text-center sm:px-8"
        initial={reduceMotion ? 'visible' : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <motion.div variants={textVariants}>
          <span
            className="inline-block mb-5 rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-widest dark:shadow-[0_0_24px_rgba(245,184,91,0.18)]"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#f5b85b' }}
          >
            NestMart - Home &amp; Lifestyle
          </span>
        </motion.div>

        <motion.h2
          variants={textVariants}
          className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl dark:[text-shadow:0_6px_30px_rgba(0,0,0,0.4)]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          <span className="dark:text-white" style={{ color: '#f0f0f0' }}>
            Your Home
          </span>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>. </span>
          <span className="dark:text-[#ffd37a]" style={{ color: '#e2b87a' }}>
            Your Style
          </span>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>. </span>
          <span className="dark:text-[#8eb8ff]" style={{ color: '#7ca5d4' }}>
            Your Mart
          </span>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>.</span>
        </motion.h2>

        {subheadline && (
          <motion.p
            variants={textVariants}
            className="mt-4 text-base sm:text-lg md:mt-6 dark:text-white/78"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            {subheadline}
          </motion.p>
        )}

        <motion.div
          variants={textVariants}
          className="mx-auto mt-6 h-0.5 w-14 rounded-full dark:shadow-[0_0_18px_rgba(245,184,91,0.35)]"
          style={{ background: 'linear-gradient(90deg, #e2b87a, rgba(226,184,122,0.2))' }}
          aria-hidden="true"
        />
      </motion.div>
    </section>
  );
}
