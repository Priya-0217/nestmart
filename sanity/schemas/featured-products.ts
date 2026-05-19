export const featuredProductsSchema = {
  name: "featuredProducts",
  title: "Featured Products Section",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Section Title",
      type: "string",
      validation: (Rule: any) => Rule.required(),
      description: "e.g., 'Best Sellers', 'New Arrivals'",
    },
    {
      name: "slug",
      title: "Section Slug",
      type: "slug",
      options: {
        source: "title",
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "description",
      title: "Description",
      type: "text",
      rows: 2,
      description: "Optional description of the featured section",
    },
    {
      name: "productIds",
      title: "Product IDs",
      type: "array",
      of: [
        {
          type: "string",
        },
      ],
      description: "MongoDB product IDs to feature. Add one per line.",
      validation: (Rule: any) => Rule.min(1).max(12),
    },
    {
      name: "displayOrder",
      title: "Display Order",
      type: "number",
      description: "Position on homepage (ascending order)",
    },
    {
      name: "isActive",
      title: "Active",
      type: "boolean",
      default: true,
    },
    {
      name: "backgroundColor",
      title: "Background Color",
      type: "string",
      description: "CSS color value (e.g., #f8fafc)",
    },
    {
      name: "showCTA",
      title: "Show 'View All' Button",
      type: "boolean",
      default: false,
    },
    {
      name: "ctaLink",
      title: "'View All' Link",
      type: "string",
      description: "URL for the 'View All' button",
    },
  ],
  preview: {
    select: {
      title: "title",
      order: "displayOrder",
    },
    prepare({ title, order }: any) {
      return {
        title,
        subtitle: `Order: ${order}`,
      };
    },
  },
};
