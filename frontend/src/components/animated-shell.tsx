'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

type AnimatedShellProps = {
  children: ReactNode;
  delay?: number;
};

export function AnimatedShell({ children, delay = 0 }: AnimatedShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  );
}
