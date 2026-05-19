import { createClient } from "@sanity/client";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

const projectId = process.env.SANITY_PROJECT_ID || "";
const dataset = process.env.SANITY_DATASET || "production";
const isConfigured = Boolean(projectId && projectId !== "YOUR_PROJECT_ID" && projectId !== "placeholder");

export const sanityClient = isConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion: "2024-10-01",
      useCdn: true,
      token: process.env.SANITY_API_TOKEN,
    })
  : null;

export function isSanityConfigured() {
  return Boolean(sanityClient);
}

/**
 * Fetch all active banners ordered by displayOrder
 */
export async function getBanners() {
  if (!sanityClient) return [];
  try {
    const banners = await sanityClient.fetch(
      `*[_type == "banner" && isActive == true && (startDate <= now() || startDate == null) && (endDate >= now() || endDate == null)] | order(displayOrder asc) {
        _id,
        title,
        subtitle,
        image {
          asset->{
            url,
            metadata {
              dimensions
            }
          },
          alt
        },
        ctaText,
        ctaLink,
        backgroundColor,
        textColor
      }`
    );
    logger.info({ count: banners.length }, "Fetched banners from Sanity");
    return banners;
  } catch (error) {
    logger.error({ error }, "Failed to fetch banners from Sanity");
    return [];
  }
}

/**
 * Fetch published blog posts with pagination
 */
export async function getBlogPosts(limit = 10, offset = 0) {
  if (!sanityClient) return [];
  try {
    const posts = await sanityClient.fetch(
      `*[_type == "blogPost" && isPublished == true] | order(publishedAt desc) [${offset}...${
        offset + limit
      }] {
        _id,
        title,
        slug,
        excerpt,
        featuredImage {
          asset->{
            url
          },
          alt
        },
        author,
        category,
        publishedAt,
        seoTitle,
        seoDescription
      }`
    );
    return posts;
  } catch (error) {
    logger.error({ error }, "Failed to fetch blog posts from Sanity");
    return [];
  }
}

/**
 * Fetch a single blog post by slug
 */
export async function getBlogPostBySlug(slug: string) {
  if (!sanityClient) return null;
  try {
    const post = await sanityClient.fetch(
      `*[_type == "blogPost" && slug.current == $slug && isPublished == true][0] {
        _id,
        title,
        slug,
        excerpt,
        content[] {
          ...
        },
        featuredImage {
          asset->{
            url
          },
          alt
        },
        author,
        category,
        tags,
        publishedAt,
        updatedAt,
        seoTitle,
        seoDescription
      }`,
      { slug }
    );
    return post;
  } catch (error) {
    logger.error({ error, slug }, "Failed to fetch blog post from Sanity");
    return null;
  }
}

/**
 * Fetch featured products sections
 */
export async function getFeaturedProducts() {
  if (!sanityClient) return [];
  try {
    const sections = await sanityClient.fetch(
      `*[_type == "featuredProducts" && isActive == true] | order(displayOrder asc) {
        _id,
        title,
        slug,
        description,
        productIds,
        backgroundColor,
        showCTA,
        ctaLink
      }`
    );
    return sections;
  } catch (error) {
    logger.error({ error }, "Failed to fetch featured products from Sanity");
    return [];
  }
}

/**
 * Fetch homepage settings
 */
export async function getHomepageSettings() {
  if (!sanityClient) return {};
  try {
    const settings = await sanityClient.fetch(
      `*[_type == "homepageSettings"][0] {
        title,
        metaDescription,
        heroTitle,
        heroSubtitle,
        heroCTA,
        promoMessage,
        enablePromo
      }`
    );
    return settings || {};
  } catch (error) {
    logger.error({ error }, "Failed to fetch homepage settings from Sanity");
    return {};
  }
}
