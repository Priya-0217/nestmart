'use client';
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
  { dir: 'up',   dur: 18, offset: 0    },
  { dir: 'down', dur: 22, offset: -50  },
  { dir: 'up',   dur: 15, offset: 0    },
  { dir: 'down', dur: 19, offset: -50  },
];

const HEIGHTS = [120, 150, 110, 140, 130, 160, 115, 145];

function ImageTile({ src, alt, height }: { src: string; alt: string; height: number }) {
  return (
    <div style={{ height, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-all duration-700"
        style={{ filter: 'brightness(0.85) contrast(0.9)' }}
      />
    </div>
  );
}

function ScrollCol({ colIndex, dir, dur, offset }: {
  colIndex: number; dir: string; dur: number; offset: number;
}) {
  const items = Array.from(
    { length: 8 },
    (_, i) => PRODUCT_IMAGES[(colIndex * 3 + i) % PRODUCT_IMAGES.length]
  );
  const doubled = [...items, ...items];
  const heights = Array.from({ length: doubled.length }, (_, i) => HEIGHTS[i % HEIGHTS.length]);

  const keyframes = dir === 'up'
    ? { y: ['0%', '-50%'] }
    : { y: ['-50%', '0%'] };

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
    <section className={cn(
      'relative w-full overflow-hidden rounded-3xl bg-neutral-900',
      'min-h-[320px] sm:min-h-[400px] md:min-h-[480px]',
      'flex items-center justify-center',
      className
    )}>

      {/* Scrolling product images – softer presence */}
      <div className="absolute inset-0 grid grid-cols-4 gap-1 opacity-50">
        {COLS.map((col, i) => (
          <div key={i} style={{ overflow: 'hidden' }}>
            <ScrollCol colIndex={i} {...col} />
          </div>
        ))}
      </div>

      {/* Gentle overlays – not too bold */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/30 to-black/40" />
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)' }} />

      {/* Text content – softer colors */}
      <motion.div
        className="relative z-10 px-6 text-center sm:px-8"
        initial={reduceMotion ? 'visible' : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <motion.div variants={textVariants}>
          <span className="inline-block mb-5 px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#f5b85b' }}>
            NestMart — Home &amp; Lifestyle
          </span>
        </motion.div>

        <motion.h2 variants={textVariants}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <span style={{ color: '#f0f0f0' }}>Your Home</span>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>. </span>
          <span style={{ color: '#e2b87a' }}>Your Style</span>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>. </span>
          <span style={{ color: '#7ca5d4' }}>Your Mart</span>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>.</span>
        </motion.h2>

        {subheadline && (
          <motion.p variants={textVariants}
            className="mt-4 text-base sm:text-lg md:mt-6"
            style={{ color: 'rgba(255,255,255,0.6)' }}>
            {subheadline}
          </motion.p>
        )}

        <motion.div variants={textVariants}
          className="mx-auto mt-6 h-0.5 w-14 rounded-full"
          style={{ background: 'linear-gradient(90deg, #e2b87a, rgba(226,184,122,0.2))' }}
          aria-hidden="true" />
      </motion.div>
    </section>
  );
}