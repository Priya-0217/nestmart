'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { TRANSITION_FAST } from '@/lib/motion';

type FadeInProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ ...TRANSITION_FAST, delay }}
    >
      {children}
    </motion.div>
  );
}
