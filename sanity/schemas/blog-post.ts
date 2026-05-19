export const blogPostSchema = {
  name: "blogPost",
  title: "Blog Post",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule: any) => Rule.required().min(10),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      description: "Brief summary of the blog post",
    },
    {
      name: "featuredImage",
      title: "Featured Image",
      type: "image",
      options: {
        hotspot: true,
      },
    },
    {
      name: "content",
      title: "Content",
      type: "array",
      of: [
        { type: "block" },
        {
          type: "image",
          options: {
            hotspot: true,
          },
        },
      ],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "author",
      title: "Author",
      type: "string",
      description: "Name of the blog post author",
    },
    {
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Home Decor", value: "decor" },
          { title: "Kitchen Tips", value: "kitchen" },
          { title: "Product Reviews", value: "reviews" },
          { title: "Lifestyle", value: "lifestyle" },
          { title: "Trends", value: "trends" },
        ],
      },
    },
    {
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
    },
    {
      name: "publishedAt",
      title: "Published Date",
      type: "datetime",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "updatedAt",
      title: "Last Updated",
      type: "datetime",
    },
    {
      name: "isPublished",
      title: "Published",
      type: "boolean",
      default: false,
    },
    {
      name: "seoTitle",
      title: "SEO Title",
      type: "string",
      description: "Meta title for search engines (max 60 chars)",
    },
    {
      name: "seoDescription",
      title: "SEO Description",
      type: "string",
      description: "Meta description for search engines (max 160 chars)",
    },
  ],
  preview: {
    select: {
      title: "title",
      media: "featuredImage",
      date: "publishedAt",
    },
    prepare({ title, media, date }: any) {
      const formattedDate = new Date(date).toLocaleDateString();
      return {
        title,
        media,
        subtitle: formattedDate,
      };
    },
  },
};
