import type { Request, Response } from "express";
import * as cmsService from "../services/cms.service.js";

export async function getHomepage(req: Request, res: Response) {
  const data = await cmsService.getHomepageData();
  res.json(data);
}

export async function getBanners(req: Request, res: Response) {
  const banners = await cmsService.getBanners();
  res.json({ banners });
}

export async function listBlogPosts(req: Request, res: Response) {
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
  const page = parseInt(req.query.page as string) || 1;
  const offset = (page - 1) * limit;

  const posts = await cmsService.getBlogPosts(limit, offset);
  res.json({ posts, page, limit });
}

export async function getBlogPost(req: Request, res: Response) {
  const { slug } = req.params;
  if (!slug) {
    return res.status(400).json({ message: "Blog post slug is required" });
  }

  const post = await cmsService.getBlogPostBySlug(slug);

  if (!post) {
    return res.status(404).json({ message: "Blog post not found" });
  }

  res.json(post);
}

export async function getFeaturedProducts(req: Request, res: Response) {
  const sections = await cmsService.getFeaturedProducts();
  res.json({ sections });
}

export async function getHomepageSettings(req: Request, res: Response) {
  const settings = await cmsService.getHomepageSettings();
  res.json(settings);
}
