import * as sanityConfig from "../config/sanity.js";
import { logger } from "../config/logger.js";

/**
 * Service to fetch and cache CMS content from Sanity
 */

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class CmsCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
  }
}

const cmsCache = new CmsCache();

function isSanityReady() {
  return Boolean(sanityConfig.sanityClient);
}

export async function getBanners() {
  if (!isSanityReady()) return [];
  const cacheKey = "cms:banners";
  const cached = cmsCache.get(cacheKey);
  if (cached) return cached;

  const banners = await sanityConfig.getBanners();
  cmsCache.set(cacheKey, banners);
  return banners;
}

export async function getBlogPosts(limit?: number, offset?: number) {
  if (!isSanityReady()) return [];
  const cacheKey = `cms:blog-posts:${limit}:${offset}`;
  const cached = cmsCache.get(cacheKey);
  if (cached) return cached;

  const posts = await sanityConfig.getBlogPosts(limit, offset);
  cmsCache.set(cacheKey, posts);
  return posts;
}

export async function getBlogPostBySlug(slug: string) {
  if (!isSanityReady()) return null;
  const cacheKey = `cms:blog-post:${slug}`;
  const cached = cmsCache.get(cacheKey);
  if (cached) return cached;

  const post = await sanityConfig.getBlogPostBySlug(slug);
  cmsCache.set(cacheKey, post);
  return post;
}

export async function getFeaturedProducts() {
  if (!isSanityReady()) return [];
  const cacheKey = "cms:featured-products";
  const cached = cmsCache.get(cacheKey);
  if (cached) return cached;

  const sections = await sanityConfig.getFeaturedProducts();
  cmsCache.set(cacheKey, sections);
  return sections;
}

export async function getHomepageSettings() {
  if (!isSanityReady()) return {};
  const cacheKey = "cms:homepage-settings";
  const cached = cmsCache.get(cacheKey);
  if (cached) return cached;

  const settings = await sanityConfig.getHomepageSettings();
  cmsCache.set(cacheKey, settings);
  return settings;
}

export async function getHomepageData() {
  try {
    const [banners, settings, featuredProducts] = await Promise.all([
      getBanners(),
      getHomepageSettings(),
      getFeaturedProducts(),
    ]);

    return {
      settings,
      banners,
      featuredProducts,
    };
  } catch (error) {
    logger.error({ error }, "Failed to fetch homepage CMS data");
    return {
      settings: {},
      banners: [],
      featuredProducts: [],
    };
  }
}

export function clearCmsCache(): void {
  cmsCache.clear();
  logger.info("CMS cache cleared");
}
