export const homepageSettingsSchema = {
  name: "homepageSettings",
  title: "Homepage Settings",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Page Title",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "metaDescription",
      title: "Meta Description",
      type: "string",
      description: "SEO meta description",
    },
    {
      name: "heroTitle",
      title: "Hero Section Title",
      type: "string",
    },
    {
      name: "heroSubtitle",
      title: "Hero Section Subtitle",
      type: "string",
    },
    {
      name: "heroCTA",
      title: "Hero CTA Text",
      type: "string",
    },
    {
      name: "promoMessage",
      title: "Promo Banner Message",
      type: "string",
      description: "Sticky promo message at top (e.g., 'Free shipping on orders over $50')",
    },
    {
      name: "enablePromo",
      title: "Enable Promo Banner",
      type: "boolean",
      default: true,
    },
  ],
  preview: {
    prepare() {
      return {
        title: "Homepage Settings",
      };
    },
  },
};
