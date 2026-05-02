'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { TRANSITION_FAST } from '@/lib/motion';

export function StaggerList({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0.98, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={TRANSITION_FAST}
    >
      {children}
    </motion.div>
  );
}
