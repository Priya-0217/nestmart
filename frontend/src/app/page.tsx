import { Metadata } from 'next';
import { categories, heroSlides, homeCollections, homeFeatures, products, testimonials } from '@/data/catalog';
import { CategoryGrid } from '@/components/home/category-grid';
import { CollectionStrip } from '@/components/home/collection-strip';
import { FeatureGrid } from '@/components/home/feature-grid';
import { HeroSection } from '@/components/home/hero-section';
import { NewsletterCta } from '@/components/home/newsletter-cta';
import { PromoStrip } from '@/components/home/promo-strip';
import { PersonalizedShelves } from '@/components/home/personalized-shelves';
import { ReviewMarquee } from '@/components/home/review-marquee';
import { SectionHeading } from '@/components/ui/section-heading';

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
    <div className="space-y-10">
      <HeroSection slides={heroSlides} />

      <section className="space-y-4">
        <SectionHeading title="Featured Categories" subtitle="Explore by room and discover products tailored to your space." />
        <CategoryGrid categories={categories} />
      </section>

      <PromoStrip />

      <PersonalizedShelves products={products} />

      {homeCollections.map((collection) => (
        <CollectionStrip
          key={collection.id}
          title={collection.title}
          subtitle="Selected by our in-house stylists."
          productIds={collection.productIds}
        />
      ))}

      <section className="space-y-4">
        <SectionHeading title="Why NestMart" subtitle="Built to make shopping for home essentials effortless." />
        <FeatureGrid features={homeFeatures} />
      </section>

      <section className="space-y-4">
        <SectionHeading title="Customer Notes" subtitle="Real feedback from homeowners and design professionals." />
        <ReviewMarquee testimonials={testimonials} />
      </section>

      <NewsletterCta />
    </div>
  );
}
