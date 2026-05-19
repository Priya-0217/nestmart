'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type ProductDetailTabsProps = {
  description: string;
  specs: Record<string, string>;
};

const faqItems = [
  {
    q: 'How long does shipping take?',
    a: 'Standard shipping usually takes 3-7 business days, depending on your delivery location.'
  },
  {
    q: 'Can I return this product?',
    a: 'Yes, returns are accepted within the return window if the item is unused and in original packaging.'
  },
  {
    q: 'Does this include warranty?',
    a: 'Eligible products include manufacturer or seller warranty. Warranty details are shared in your invoice.'
  }
];

export function ProductDetailTabs({ description, specs }: ProductDetailTabsProps) {
  const [active, setActive] = useState<'description' | 'specs' | 'shipping' | 'faqs'>('description');

  return (
    <section className="surface space-y-6 rounded-[28px] p-6 sm:p-8">
      <div className="flex flex-wrap gap-3">
        {[
          { id: 'description', label: 'Full Description' },
          { id: 'specs', label: 'Specifications' },
          { id: 'shipping', label: 'Shipping & Returns' },
          { id: 'faqs', label: 'FAQs' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`focus-ring rounded-full border px-4 py-2 text-sm font-semibold transition ${active === tab.id ? 'border-primary bg-primary text-white shadow-sm' : 'border-primary/20 bg-transparent text-primary hover:bg-primary/5'
              }`}
            onClick={() => setActive(tab.id as typeof active)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-[24px] bg-background/45 p-5 sm:p-6">
        {active === 'description' ? (
          <p className="text-sm leading-8 text-foreground/75">{description || 'Detailed description will be updated soon.'}</p>
        ) : null}

        {active === 'specs' ? (
          Object.keys(specs).length > 0 ? (
            <dl className="grid gap-4 sm:grid-cols-2">
              {Object.entries(specs).map(([key, value]) => (
                <div key={key} className="rounded-2xl border border-border bg-card px-4 py-4">
                  <dt className="text-xs uppercase tracking-[0.18em] text-foreground/50">{key}</dt>
                  <dd className="mt-2 text-sm font-medium text-foreground">{String(value)}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-foreground/65">No specification details available yet.</p>
          )
        ) : null}

        {active === 'shipping' ? (
          <div className="space-y-4 text-sm leading-8 text-foreground/75">
            <p>Orders are processed within 24 hours. Delivery timelines vary by shipping option selected at checkout.</p>
            <p>Free standard shipping may apply based on cart value. Express delivery is available on select pincodes.</p>
            <p>Returns are accepted as per policy; refund timelines depend on payment method and bank processing.</p>
          </div>
        ) : null}

        {active === 'faqs' ? (
          <div className="space-y-3">
            {faqItems.map((item) => (
              <details key={item.q} className="group rounded-2xl border border-border bg-card px-4 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-foreground focus:outline-none">
                  <span>{item.q}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-primary transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <p className="mt-3 pr-4 text-sm leading-7 text-foreground/70">{item.a}</p>
              </details>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
