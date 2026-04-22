'use client';

import { motion } from 'framer-motion';
import { RefreshCw, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { TRANSITION_STANDARD } from '@/lib/motion';
import { HomeFeature } from '@/lib/types';

const iconMap = {
  truck: Truck,
  shield: ShieldCheck,
  sparkles: Sparkles,
  refresh: RefreshCw
};

const iconColors = [
  { container: 'bg-primary/10',  icon: 'text-primary'   },
  { container: 'bg-secondary/15', icon: 'text-secondary' },
  { container: 'bg-primary/15',  icon: 'text-primary'   },
  { container: 'bg-secondary/10', icon: 'text-secondary' }
];

export function FeatureGrid({ features }: { features: HomeFeature[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {features.map((feature, index) => {
        const Icon = iconMap[feature.icon];
        const colors = iconColors[index % iconColors.length];
        return (
          <motion.article
            key={feature.id}
            className="surface p-6"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...TRANSITION_STANDARD, delay: index * 0.07 }}
            whileHover={{ y: -4 }}
          >
            <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${colors.container} ${colors.icon}`}>
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground/65">{feature.description}</p>
          </motion.article>
        );
      })}
    </div>
  );
}
