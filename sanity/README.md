# NestMart Sanity CMS

Headless CMS for NestMart homepage content management.

## Quick Start

```bash
# Install dependencies
npm install

# Configure Sanity (first time only)
npm run init

# Start development server
npm run dev
# → Sanity Studio available at http://localhost:3333
```

## Configuration

Update `.env.local` with your Sanity project credentials:

```
SANITY_STUDIO_PROJECT_ID=your_project_id
SANITY_STUDIO_DATASET=production
```

## Schemas

- **Banner** - Homepage promotional banners
- **Blog Post** - Content marketing articles
- **Featured Products** - Curated product collections
- **Homepage Settings** - Global homepage configuration

## Deployment

Deploy Sanity Studio to Sanity's hosted platform:

```bash
npm run deploy
```

Studio will be available at: `https://<project-id>.sanity.studio`

## API Integration

Backend fetches CMS content via read-only API token:

**Endpoint:** `https://api.sanity.io/v2024-10-01/data/query/{dataset}`

See `../backend/src/config/sanity.ts` for query examples.

## Content Guidelines

### Banners
- Use 1920×1080px images for hero banners
- Limit to 5-6 active banners for performance
- Set start/end dates for seasonal campaigns

### Blog Posts
- Write compelling SEO titles (max 60 chars)
- Include featured images (1200×630px optimal)
- Publish only reviewed/proofread content
- Add 3-5 relevant tags per post

### Featured Products
- Reference MongoDB product `_id` values
- Limit to 12 products per section
- Use clear, descriptive section titles
- Reorder sections as needed for promotions

## Support

For Sanity documentation: https://www.sanity.io/docs
