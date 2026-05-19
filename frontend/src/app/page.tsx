import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { heroSlides, homeCollections, homeFeatures, testimonials } from '@/data/catalog';
import { productsApi, categoriesApi, reviewsApi, type ProductSummary, type CategoryTreeItem } from '@/lib/api';
import { Product, Testimonial } from '@/lib/types';
import { SkiperHero } from '@/features/home/components/skiper-hero';
import { CategoryGrid } from '@/features/home/components/category-grid';
import { ProductGrid } from '@/features/catalog/components/product-grid';
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

export default async function HomePage() {
  const [
    productsData,
    featuredProductsData,
    popularProductsData,
    categoriesResponse,
    reviewsData
  ] = await Promise.all([
    productsApi.list({ limit: 8 }, { cache: 'no-store' }).catch(() => ({
      items: [],
      pagination: { page: 1, limit: 8, total: 0, totalPages: 0 }
    })),
    productsApi.list({ limit: 8, isFeatured: true }, { cache: 'no-store' }).catch(() => ({
      items: [],
      pagination: { page: 1, limit: 8, total: 0, totalPages: 0 }
    })),
    productsApi.list({ limit: 8, sort: 'popular' }, { cache: 'no-store' }).catch(() => ({
      items: [],
      pagination: { page: 1, limit: 8, total: 0, totalPages: 0 }
    })),
    categoriesApi.tree({ cache: 'no-store' }).catch(() => ({ items: [] })),
    reviewsApi.list({ limit: 12, status: 'approved' }, { cache: 'no-store' }).catch(() => ({
      items: [],
      pagination: { page: 1, limit: 12, total: 0, totalPages: 0 }
    }))
  ]);

  const categoriesData = categoriesResponse.items || [];

  const mapProductSummary = (item: ProductSummary, tag: string): Product => ({
    // Category can arrive as either an ObjectId string or populated object.
    // Keep a normalized string for downstream UI and tracking.
    id: item._id,
    slug: item.slug || item._id,
    name: item.title,
    brand: item.brand,
    price: item.price,
    compareAtPrice: item.compareAtPrice ?? item.price,
    images: item.images?.length ? item.images : ['/product-placeholder.svg'],
    rating: item.ratingAverage || 0,
    reviewCount: item.ratingCount || 0,
    stock: item.stock || 0,
    category: String(typeof item.category === 'string' ? item.category : item.category?._id || ''),
    tag,
    description: item.description || '',
    longDescription: '',
    features: item.features || [],
    specs: {},
    variants: item.variants || []
  });

  // Prefer explicit featured products; if none are flagged, fall back to popular products.
  const featuredSource = (featuredProductsData.items || []).length > 0 ? featuredProductsData.items : (popularProductsData.items || []);

  const mappedItems: Product[] = (productsData.items || []).map((item) => mapProductSummary(item, 'New'));
  const featuredItems: Product[] = featuredSource.map((item) =>
    mapProductSummary(item, (featuredProductsData.items || []).length > 0 ? 'Featured' : 'Popular')
  );

  const categories = categoriesData.map((c: CategoryTreeItem) => ({
    id: c._id,
    name: c.name,
    href: `/products?category=${c.slug || c._id}`,
    image: c.image || '/product-placeholder.svg',
    count: c.count || 0
  }));

  const dynamicTestimonials: Testimonial[] = (reviewsData.items || []).length > 0
    ? reviewsData.items.map((review) => ({
        id: review._id,
        name: review.userName,
        role: review.verifiedPurchase ? 'Verified Buyer' : 'Customer',
        quote: review.body,
        rating: review.rating
      }))
    : testimonials;

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

      {featuredItems.length > 0 ? (
        <AmbientDotPattern>
          <ScrollReveal>
            <section className="space-y-4">
              <SectionHeading
                title="Featured Products"
                subtitle={
                  featuredProductsData.items.length > 0
                    ? 'Hand-picked products selected by our merchandising team.'
                    : 'Trending picks shown while featured flags are being updated.'
                }
              />
              <ProductGrid products={featuredItems} />
            </section>
          </ScrollReveal>
        </AmbientDotPattern>
      ) : null}

      <AmbientDotPattern>
        <ScrollReveal>
          <section className="space-y-4">
            <SectionHeading title="New Arrivals" subtitle="Discover our latest collections and unique home decor." />
            <ProductGrid products={mappedItems} />
          </section>
        </ScrollReveal>
      </AmbientDotPattern>

      <AmbientDotPattern>
        <ScrollReveal>
          <PersonalizedShelves products={mappedItems} />
        </ScrollReveal>
      </AmbientDotPattern>

      {homeCollections.slice(0, 1).map((collection) => (
        <AmbientDotPattern key={collection.id}>
          <ScrollReveal>
            <CollectionStrip
              title={collection.title}
              subtitle="Selected by our in-house stylists."
              products={mappedItems}
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
              products={mappedItems}
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
            <ReviewMarquee testimonials={dynamicTestimonials} />
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
