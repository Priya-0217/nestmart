import { Metadata } from 'next';
import { categories, heroSlides, homeCollections, homeFeatures, products, testimonials } from '@/data/catalog';
import { CategoryGrid } from '@/components/home/category-grid';
import { CollectionStrip } from '@/components/home/collection-strip';
import { FeatureGrid } from '@/components/home/feature-grid';
import { SkiperHero } from '@/components/home/skiper-hero';
import { NewsletterCta } from '@/components/home/newsletter-cta';
import { PromoStrip } from '@/components/home/promo-strip';
import { PersonalizedShelves } from '@/components/home/personalized-shelves';
import { ReviewMarquee } from '@/components/home/review-marquee';
import { SkiperMarquee } from '@/components/home/skiper-marquee';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { SectionHeading } from '@/components/ui/section-heading';
import { PromoVideoText } from '@/components/home/promo-video-text';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Shop curated furniture, decor, and home essentials with NestMart.',
  openGraph: {
    title: 'NestMart Home',
    description: 'Shop curated furniture, decor, and home essentials with NestMart.'
  }
};

const offerHighlights = [
  {
    id: 'offer-1',
    title: 'Bundle Week',
    subtitle: 'Save 25% on living sets',
    href: '/products',
    image: products[0].images[0],
    tag: 'Save 25%'
  },
  {
    id: 'offer-2',
    title: 'Kitchen Refresh',
    subtitle: 'Free shipping above INR 120',
    href: '/products?category=Kitchen',
    image: products[2].images[0],
    tag: 'Free Ship'
  },
  {
    id: 'offer-3',
    title: 'Bedroom Layers',
    subtitle: 'Bundle-ready sleep picks',
    href: '/products?category=Bedroom',
    image: products[3].images[0],
    tag: 'Hot Deal'
  },
  {
    id: 'offer-4',
    title: 'Decor Drops',
    subtitle: 'New accents under INR 99',
    href: '/products?category=Decor',
    image: products[5].images[0],
    tag: 'Trending'
  }
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      <SkiperHero slides={heroSlides} />

      <ScrollReveal>
        <section className="space-y-4">
          <SectionHeading title="Featured Categories" subtitle="Explore by room and discover products tailored to your space." />
          <CategoryGrid categories={categories} />
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="space-y-4">
          <SectionHeading title="Limited-time offers" subtitle="Bundle-worthy savings with fast shipping perks." />
          <SkiperMarquee items={offerHighlights} ariaLabel="Limited-time offers" />
        </section>
      </ScrollReveal>

      <PromoStrip />

      <ScrollReveal>
        <PersonalizedShelves products={products} />
      </ScrollReveal>

      <ScrollReveal>
        <PromoVideoText
          headline="Your Home. Your Style. Your Mart."
          subheadline="Curated collections designed for modern living"
        />
      </ScrollReveal>

      {homeCollections.map((collection) => (
        <ScrollReveal key={collection.id}>
          <CollectionStrip
            title={collection.title}
            subtitle="Selected by our in-house stylists."
            productIds={collection.productIds}
          />
        </ScrollReveal>
      ))}

      <ScrollReveal>
        <section className="space-y-4">
          <SectionHeading title="Why NestMart" subtitle="Built to make shopping for home essentials effortless." />
          <FeatureGrid features={homeFeatures} />
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="space-y-4">
          <SectionHeading title="Customer Notes" subtitle="Real feedback from homeowners and design professionals." />
          <ReviewMarquee testimonials={testimonials} />
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <NewsletterCta />
      </ScrollReveal>
    </div>
  );
}
