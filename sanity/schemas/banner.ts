export const bannerSchema = {
  name: "banner",
  title: "Homepage Banner",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Banner Title",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "subtitle",
      title: "Subtitle",
      type: "string",
      description: "Secondary text displayed on the banner",
    },
    {
      name: "image",
      title: "Background Image",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "ctaText",
      title: "Call-to-Action Text",
      type: "string",
      description: "e.g., 'Shop Now', 'Explore', 'Learn More'",
    },
    {
      name: "ctaLink",
      title: "CTA Link",
      type: "string",
      description: "URL to navigate to when CTA is clicked",
    },
    {
      name: "backgroundColor",
      title: "Background Color Overlay",
      type: "string",
      description: "Optional overlay color (hex)",
    },
    {
      name: "textColor",
      title: "Text Color",
      type: "string",
      description: "Color of text (hex). Default: white",
    },
    {
      name: "isActive",
      title: "Active",
      type: "boolean",
      default: true,
      description: "Whether this banner is displayed",
    },
    {
      name: "displayOrder",
      title: "Display Order",
      type: "number",
      description: "Sort order for multiple banners (ascending)",
    },
    {
      name: "startDate",
      title: "Start Date",
      type: "datetime",
      description: "When to start displaying this banner",
    },
    {
      name: "endDate",
      title: "End Date",
      type: "datetime",
      description: "When to stop displaying this banner",
    },
  ],
  preview: {
    select: {
      title: "title",
      media: "image",
      subtitle: "subtitle",
    },
  },
};
