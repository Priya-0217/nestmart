'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

type PromoVideoTextProps = {
  videoSrc?: string;
  headline: string;
  subheadline?: string;
  className?: string;
};

/**
 * Magic UI inspired video-text promotional section.
 * Features a looping video background with dark overlay and centered text.
 */
export function PromoVideoText({
  videoSrc = 'https://videos.unsplash.com/video-static/converted/video-static-1701080627.mp4?w=1200&q=80',
  headline,
  subheadline,
  className
}: PromoVideoTextProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => setIsLoaded(true);
    video.addEventListener('loadeddata', handleLoadedData);

    return () => video.removeEventListener('loadeddata', handleLoadedData);
  }, []);

  const textVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.12,
        delayChildren: reduceMotion ? 0 : 0.1
      }
    }
  };

  return (
    <section
      className={cn(
        'relative w-full overflow-hidden rounded-3xl',
        'min-h-[320px] sm:min-h-[400px] md:min-h-[480px]',
        'flex items-center justify-center',
        className
      )}
    >
      {/* Video Background */}
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay
        muted
        loop
        playsInline
        className={cn(
          'absolute inset-0 h-full w-full object-cover',
          isLoaded ? 'opacity-100' : 'opacity-0',
          'transition-opacity duration-500'
        )}
      />

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/65 to-black/70" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50" />

      {/* Subtle animated glow (reduced motion safe) */}
      {!reduceMotion ? (
        <motion.div
          className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-secondary/20 blur-3xl"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          aria-hidden="true"
        />
      ) : null}

      {/* Content */}
      <motion.div
        className="relative z-10 px-6 text-center sm:px-8"
        initial={reduceMotion ? 'visible' : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <motion.h2
          variants={textVariants}
          className="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl"
        >
          {headline}
        </motion.h2>

        {subheadline ? (
          <motion.p variants={textVariants} className="mt-4 text-lg text-white/80 sm:text-xl md:mt-6">
            {subheadline}
          </motion.p>
        ) : null}

        {/* Decorative line */}
        <motion.div
          variants={textVariants}
          className="mx-auto mt-6 h-1 w-16 rounded-full bg-gradient-to-r from-secondary via-secondary to-secondary/40"
          aria-hidden="true"
        />
      </motion.div>

      {/* Loading fallback */}
      {!isLoaded ? (
        <div className="absolute inset-0 bg-gradient-to-b from-card/80 to-background/80 animate-pulse" />
      ) : null}
    </section>
  );
}
