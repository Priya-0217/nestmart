'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MouseEvent, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TRANSITION_FAST, TRANSITION_SLOW, TRANSITION_STANDARD } from '@/lib/motion';

type HeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
};

export function HeroSection({ slides }: { slides: HeroSlide[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [firstImageLoaded, setFirstImageLoaded] = useState(false);
  const slideDuration = 6000;

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, slideDuration);

    return () => clearInterval(timer);
  }, [slides.length]);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    setParallax({ x: x * 12, y: y * 12 });
  };

  const handleMouseLeave = () => {
    setParallax({ x: 0, y: 0 });
  };

  const activeSlide = slides[activeIndex];

  return (
    <section className="surface overflow-hidden p-1">
      <div
        className="relative min-h-[420px] h-[420px] overflow-hidden rounded-[1rem] md:min-h-[520px] md:h-[520px]"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {!firstImageLoaded ? <div className="absolute inset-0 bg-[#f0ebe3]" /> : null}
        <AnimatePresence mode="wait">
          <motion.div key={activeSlide.id} className="absolute inset-0" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={TRANSITION_SLOW}>
            <motion.div className="absolute inset-0" animate={{ x: parallax.x, y: parallax.y, scale: 1.06 }} transition={{ duration: slideDuration / 1000, ease: 'linear' }}>
              <Image
                src={activeSlide.image}
                alt={activeSlide.title}
                fill
                className="object-cover"
                priority={activeIndex === 0}
                sizes="100vw"
                onLoadingComplete={() => {
                  if (!firstImageLoaded && activeIndex === 0) {
                    setFirstImageLoaded(true);
                  }
                }}
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/45 to-transparent" />
            <motion.div animate={{ x: parallax.x * 0.6, y: parallax.y * 0.6 }} transition={TRANSITION_FAST} style={{ willChange: 'transform' }}>
              <motion.div
                key={`${activeSlide.id}-text`}
                className="relative flex h-full max-w-2xl flex-col justify-center gap-3 p-6 text-white md:p-10"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: {
                    transition: {
                      staggerChildren: 0.08
                    }
                  }
                }}
              >
                <motion.p
                  className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary"
                  variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: TRANSITION_STANDARD } }}
                >
                  {activeSlide.eyebrow}
                </motion.p>
                <motion.h1 className="text-3xl font-semibold leading-tight md:text-5xl" variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: TRANSITION_STANDARD } }}>
                  {activeSlide.title}
                </motion.h1>
                <motion.p className="max-w-xl text-sm text-white/85 md:text-base" variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: TRANSITION_STANDARD } }}>
                  {activeSlide.subtitle}
                </motion.p>
                <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: TRANSITION_STANDARD } }}>
                  <Link href={activeSlide.ctaHref}>
                    <Button size="lg" className="mt-2">
                      {activeSlide.ctaLabel}
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              aria-label={`Go to slide ${index + 1}`}
              className="relative h-2 w-10 overflow-hidden rounded-full bg-white/25"
              onClick={() => setActiveIndex(index)}
            >
              {activeIndex === index ? (
                <motion.span
                  key={`progress-${slide.id}`}
                  className="absolute left-0 top-0 h-full rounded-full bg-secondary"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: slideDuration / 1000, ease: 'linear' }}
                />
              ) : null}
            </button>
          ))}
        </div>

        <button
          onClick={() => setActiveIndex((activeIndex - 1 + slides.length) % slides.length)}
          aria-label="Previous slide"
          className="icon-button focus-ring absolute left-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-foreground hover:bg-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => setActiveIndex((activeIndex + 1) % slides.length)}
          aria-label="Next slide"
          className="icon-button focus-ring absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-foreground hover:bg-white"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
