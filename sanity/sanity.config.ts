import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemas/index.js";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || "YOUR_PROJECT_ID";
const dataset = process.env.SANITY_STUDIO_DATASET || "production";

export default defineConfig({
  name: "nestmart-studio",
  title: "NestMart CMS",
  projectId,
  dataset,
  plugins: [
    structureTool(),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
  document: {
    productionUrl: async (prev: string, { document }: any) => {
      const baseUrl = "https://nestmart.com";
      if (document._type === "blogPost") {
        return `${baseUrl}/blog/${document.slug?.current}`;
      }
      return baseUrl;
    },
  },
});
