import { MetadataRoute } from 'next';
import { products } from '@/data/catalog';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://nestmart.example.com';
  const staticRoutes: MetadataRoute.Sitemap = ['/', '/products', '/cart', '/checkout', '/account', '/auth/login', '/auth/register', '/auth/forgot-password'].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.7
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${base}/products/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8
  }));

  return [...staticRoutes, ...productRoutes];
}
