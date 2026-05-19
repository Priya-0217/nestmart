import { Router, type Request, type Response } from "express";
import * as cmsService from "../services/cms.service.js";
import * as cmsController from "../controllers/cms.controller.js";

export const cmsRouter = Router();

/**
 * GET /api/cms/homepage
 * Fetch complete homepage CMS data (banners, settings, featured products)
 */
cmsRouter.get("/homepage", cmsController.getHomepage);

/**
 * GET /api/cms/banners
 * Fetch active promotional banners
 */
cmsRouter.get("/banners", cmsController.getBanners);

/**
 * GET /api/cms/blog
 * Fetch published blog posts with pagination
 * Query: ?limit=10&page=1
 */
cmsRouter.get("/blog", cmsController.listBlogPosts);

/**
 * GET /api/cms/blog/:slug
 * Fetch a single blog post by slug
 */
cmsRouter.get("/blog/:slug", cmsController.getBlogPost);

/**
 * GET /api/cms/featured-products
 * Fetch featured products sections
 */
cmsRouter.get("/featured-products", cmsController.getFeaturedProducts);

/**
 * GET /api/cms/settings
 * Fetch homepage settings
 */
cmsRouter.get("/settings", cmsController.getHomepageSettings);
