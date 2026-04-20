'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, type Transition } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const AUTO_ROTATE_MS = 6500;

type HeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
};

type SkiperHeroProps = {
  slides: HeroSlide[];
  className?: string;
};

export function SkiperHero({ slides, className }: SkiperHeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion || slides.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, AUTO_ROTATE_MS);

    return () => clearInterval(timer);
  }, [reduceMotion, slides.length]);

  const activeSlide = slides[activeIndex];

  const textContainer = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.1,
        delayChildren: reduceMotion ? 0 : 0.05
      }
    }
  } as const;

  const textItem = {
    hidden: { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.4, ease: 'easeOut' }
    }
  } as const;

  const imageInitial = reduceMotion
    ? false
    : {
        opacity: 0,
        clipPath: 'inset(12% 18% 12% 18% round 28px)',
        scale: 1.02
      };

  const imageAnimate = reduceMotion
    ? { opacity: 1 }
    : {
        opacity: 1,
        clipPath: 'inset(0% 0% 0% 0% round 28px)',
        scale: 1,
        transition: { duration: 0.6, ease: 'easeOut' }
      };

  const floatTransition: Transition = reduceMotion
    ? { duration: 0 }
    : { duration: 6, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' };

  return (
    <section className={cn('surface overflow-hidden p-1', className)}>
      <div className="relative overflow-hidden rounded-[1.5rem] bg-card">
        <div className="grid items-center gap-10 px-6 py-10 md:grid-cols-[1.1fr_0.9fr] md:px-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id}
              initial={reduceMotion ? false : { opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -18 }}
              transition={{ duration: reduceMotion ? 0 : 0.4, ease: 'easeOut' }}
              className="flex flex-col gap-5"
            >
              <motion.div initial={reduceMotion ? false : 'hidden'} animate="show" variants={textContainer}>
                <motion.p
                  variants={textItem}
                  className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary"
                >
                  {activeSlide.eyebrow}
                </motion.p>
                <motion.h1
                  variants={textItem}
                  className="mt-3 text-3xl font-semibold leading-tight text-foreground md:text-5xl"
                >
                  {activeSlide.title}
                </motion.h1>
                <motion.p
                  variants={textItem}
                  className="mt-3 max-w-xl text-sm text-foreground/70 md:text-base"
                >
                  {activeSlide.subtitle}
                </motion.p>
                <motion.div variants={textItem} className="mt-5">
                  <Link href={activeSlide.ctaHref}>
                    <Button size="lg">{activeSlide.ctaLabel}</Button>
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  className="relative overflow-hidden rounded-[1.5rem] border border-border bg-muted shadow-sm"
                  initial={imageInitial}
                  animate={imageAnimate}
                  exit={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }}
                >
                  <motion.div animate={reduceMotion ? { y: 0 } : { y: [0, -8, 0] }} transition={floatTransition}>
                    <Image
                      src={activeSlide.image}
                      alt={activeSlide.title}
                      width={720}
                      height={520}
                      className="h-full w-full object-cover"
                      priority={activeIndex === 0}
                      sizes="(max-width: 1024px) 100vw, 720px"
                    />
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/10" />
                </motion.div>
                {!reduceMotion ? (
                  <motion.div
                    className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-secondary/30 blur-3xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              aria-label={`Go to slide ${index + 1}`}
              className="relative h-2 w-10 overflow-hidden rounded-full bg-foreground/15"
              onClick={() => setActiveIndex(index)}
            >
              {activeIndex === index ? (
                <motion.span
                  key={`progress-${slide.id}`}
                  className="absolute left-0 top-0 h-full rounded-full bg-secondary"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: reduceMotion ? 0 : AUTO_ROTATE_MS / 1000, ease: 'linear' }}
                />
              ) : null}
            </button>
          ))}
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4">
          <button
            onClick={() => setActiveIndex((activeIndex - 1 + slides.length) % slides.length)}
            aria-label="Previous slide"
            className="icon-button focus-ring inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-foreground hover:bg-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setActiveIndex((activeIndex + 1) % slides.length)}
            aria-label="Next slide"
            className="icon-button focus-ring inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-foreground hover:bg-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
