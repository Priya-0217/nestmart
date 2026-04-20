'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

type PremiumHeroProps = {
  videoSrc?: string;
  backgroundImages?: string[];
  className?: string;
};

/**
 * Premium hero with video-masked text and animated background image grid.
 * Features smooth parallax, GPU-optimized transforms, and reduced motion support.
 */
export function PremiumHero({
  videoSrc = 'https://videos.unsplash.com/video-static/converted/video-static-1701080627.mp4?w=800&q=80',
  backgroundImages = [
    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&q=80',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=400&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80',
    'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&q=80',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&q=80',
    'https://images.unsplash.com/photo-1493666438817-866a91353ca9?w=400&q=80',
    'https://images.unsplash.com/photo-1601924260368-ae2f83cf8b7f?w=400&q=80',
    'https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=400&q=80'
  ],
  className
}: PremiumHeroProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const maskSvgRef = useRef<SVGSVGElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end center']
  });

  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const backgroundY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, reduceMotion ? 0 : 80]
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => setIsVideoLoaded(true);
    video.addEventListener('loadeddata', handleLoadedData);

    return () => video.removeEventListener('loadeddata', handleLoadedData);
  }, []);

  const imageRows = [];
  for (let i = 0; i < backgroundImages.length; i += 3) {
    imageRows.push(backgroundImages.slice(i, i + 3));
  }

  // Grid animation variants
  const gridRowVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  return (
    <section
      ref={sectionRef}
      className={cn('relative w-full overflow-hidden bg-background', className)}
      style={{ minHeight: '100vh' }}
    >
      {/* Background Image Grid with Parallax */}
      <motion.div
        className="absolute inset-0 scale-110"
        style={{ y: reduceMotion ? 0 : backgroundY, willChange: 'transform' }}
      >
        <div className="relative h-full w-full">
          {imageRows.map((row, rowIdx) => (
            <motion.div
              key={`row-${rowIdx}`}
              className="flex gap-2"
              variants={gridRowVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: rowIdx * 0.1 }}
            >
              {row.map((img, imgIdx) => (
                <div
                  key={`img-${rowIdx}-${imgIdx}`}
                  className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg sm:h-40 sm:w-40 md:h-48 md:w-48"
                >
                  <Image
                    src={img}
                    alt={`Background ${rowIdx}-${imgIdx}`}
                    fill
                    className="object-cover blur-md opacity-20 transition-opacity duration-300 hover:opacity-30"
                    sizes="(max-width: 640px) 128px, (max-width: 1024px) 160px, 192px"
                  />
                </div>
              ))}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />

      {/* Content Container */}
      <div className="relative z-10 flex h-full items-center justify-center px-4">
        <div className="w-full max-w-6xl text-center">
          {/* SVG Mask Definition */}
          <svg
            ref={maskSvgRef}
            width="0"
            height="0"
            style={{ position: 'absolute', visibility: 'hidden' }}
            aria-hidden="true"
          >
            <defs>
              <mask id="text-mask">
                <rect width="100%" height="100%" fill="white" />
                <text
                  x="50%"
                  y="50%"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  fontSize="120"
                  fontWeight="700"
                  fill="black"
                  className="font-display"
                >
                  Your Home.
                </text>
                <text
                  x="50%"
                  y="calc(50% + 140px)"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  fontSize="120"
                  fontWeight="700"
                  fill="black"
                  className="font-display"
                >
                  Your Style.
                </text>
                <text
                  x="50%"
                  y="calc(50% + 280px)"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  fontSize="120"
                  fontWeight="700"
                  fill="black"
                  className="font-display"
                >
                  Your Mart.
                </text>
              </mask>
            </defs>
          </svg>

          {/* Main Heading with Video Mask */}
          <motion.div
            className="relative"
            style={{ opacity: reduceMotion ? 1 : textOpacity }}
          >
            {/* Video Element (masked by text) */}
            <div
              className="relative overflow-hidden rounded-3xl"
              style={{ height: '400px', maxHeight: '60vh' }}
            >
              <video
                ref={videoRef}
                src={videoSrc}
                autoPlay
                muted
                loop
                playsInline
                className={cn(
                  'h-full w-full object-cover transition-opacity duration-500',
                  isVideoLoaded ? 'opacity-100' : 'opacity-0'
                )}
                style={{
                  maskImage: 'url(#text-mask)',
                  WebkitMaskImage: 'url(#text-mask)',
                  willChange: 'transform'
                }}
              />

              {/* Fallback background while video loads */}
              {!isVideoLoaded ? (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse" />
              ) : null}
            </div>

            {/* Text Layer (for accessibility and fallback) */}
            <h1 className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center text-5xl font-bold leading-tight text-transparent selection:bg-transparent sm:text-6xl md:text-7xl">
              <span>Your Home.</span>
              <span>Your Style.</span>
              <span>Your Mart.</span>
            </h1>
          </motion.div>

          {/* Subheading */}
          <motion.p
            className="mt-10 text-lg text-white/80 md:text-xl"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.6,
              ease: 'easeOut'
            }}
          >
            Curated collections designed for modern living
          </motion.p>

          {/* Decorative Element */}
          <motion.div
            className="mx-auto mt-6 h-1 w-20 rounded-full bg-gradient-to-r from-transparent via-secondary to-transparent"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{
              delay: 0.5,
              duration: 0.8,
              ease: 'easeOut'
            }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
