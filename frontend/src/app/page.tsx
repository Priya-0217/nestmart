import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { categories, heroSlides, homeCollections, homeFeatures, products, testimonials } from '@/data/catalog';
import { SkiperHero } from '@/features/home/components/skiper-hero';
import { CategoryGrid } from '@/features/home/components/category-grid';
import { PromoStrip } from '@/features/home/components/promo-strip';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { SectionHeading } from '@/components/ui/section-heading';
import { AmbientDotPattern } from '@/components/ui/ambient-dot-pattern';

const PersonalizedShelves = dynamic(
  () => import('@/features/home/components/personalized-shelves').then((m) => ({ default: m.PersonalizedShelves })),
  { ssr: false }
);
const CollectionStrip = dynamic(() =>
  import('@/features/home/components/collection-strip').then((m) => ({ default: m.CollectionStrip }))
);
const PromoVideoText = dynamic(() =>
  import('@/features/home/components/promo-video-text').then((m) => ({ default: m.PromoVideoText }))
);
const FeatureGrid = dynamic(() =>
  import('@/features/home/components/feature-grid').then((m) => ({ default: m.FeatureGrid }))
);
const ReviewMarquee = dynamic(() =>
  import('@/features/home/components/review-marquee').then((m) => ({ default: m.ReviewMarquee }))
);
const NewsletterCta = dynamic(() =>
  import('@/features/home/components/newsletter-cta').then((m) => ({ default: m.NewsletterCta }))
);

export const metadata: Metadata = {
  title: 'Home',
  description: 'Shop curated furniture, decor, and home essentials with NestMart.',
  openGraph: {
    title: 'NestMart Home',
    description: 'Shop curated furniture, decor, and home essentials with NestMart.'
  }
};

export default function HomePage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <AmbientDotPattern>
        <SkiperHero slides={heroSlides} />
      </AmbientDotPattern>

      <AmbientDotPattern>
        <ScrollReveal>
          <section className="space-y-4">
            <SectionHeading title="Featured Categories" subtitle="Explore by room and discover products tailored to your space." />
            <CategoryGrid categories={categories} />
          </section>
        </ScrollReveal>
      </AmbientDotPattern>

      <AmbientDotPattern>
        <ScrollReveal>
          <PersonalizedShelves products={products} />
        </ScrollReveal>
      </AmbientDotPattern>

      {homeCollections.slice(0, 1).map((collection) => (
        <AmbientDotPattern key={collection.id}>
          <ScrollReveal>
            <CollectionStrip
              title={collection.title}
              subtitle="Selected by our in-house stylists."
              productIds={collection.productIds}
            />
          </ScrollReveal>
        </AmbientDotPattern>
      ))}

      <AmbientDotPattern>
        <ScrollReveal>
          <PromoVideoText
            headline="Your Home. Your Style. Your Mart."
            subheadline="Curated collections designed for modern living"
          />
        </ScrollReveal>
      </AmbientDotPattern>

      {homeCollections.slice(1).map((collection) => (
        <AmbientDotPattern key={collection.id}>
          <ScrollReveal>
            <CollectionStrip
              title={collection.title}
              subtitle="Selected by our in-house stylists."
              productIds={collection.productIds}
            />
          </ScrollReveal>
        </AmbientDotPattern>
      ))}

      <PromoStrip />

      <AmbientDotPattern>
        <ScrollReveal>
          <section className="space-y-4">
            <SectionHeading title="Why NestMart" subtitle="Built to make shopping for home essentials effortless." />
            <FeatureGrid features={homeFeatures} />
          </section>
        </ScrollReveal>
      </AmbientDotPattern>

      <AmbientDotPattern>
        <ScrollReveal>
          <section className="space-y-4">
            <SectionHeading title="Customer Notes" subtitle="Real feedback from homeowners and design professionals." />
            <ReviewMarquee testimonials={testimonials} />
          </section>
        </ScrollReveal>
      </AmbientDotPattern>

      <AmbientDotPattern>
        <ScrollReveal>
          <NewsletterCta />
        </ScrollReveal>
      </AmbientDotPattern>
    </div>
  );
}
