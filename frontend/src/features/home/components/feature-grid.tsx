import { RefreshCw, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { HomeFeature } from '@/lib/types';

const iconMap = {
  truck: Truck,
  shield: ShieldCheck,
  sparkles: Sparkles,
  refresh: RefreshCw
};

export function FeatureGrid({ features }: { features: HomeFeature[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {features.map((feature) => {
        const Icon = iconMap[feature.icon];
        return (
          <article key={feature.id} className="surface p-4">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/12 text-primary">
              <Icon className="h-4 w-4" />
            </span>
            <h3 className="mt-3 text-base font-semibold">{feature.title}</h3>
            <p className="mt-1 text-sm text-foreground/65">{feature.description}</p>
          </article>
        );
      })}
    </div>
  );
}
