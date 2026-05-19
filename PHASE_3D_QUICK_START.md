# Phase 3D Quick Start Guide

**Estimated time:** 15 minutes

## What's New in Phase 3D?

✅ **4 MJML Email Templates** - Branded, responsive emails  
✅ **Sanity CMS** - Headless CMS for content management  
✅ **CMS API Endpoints** - Backend routes to fetch CMS content  
✅ **Email Service Updates** - Integrated template rendering  

---

## Step 1: Backend Email Templates

**Email templates are located in:**
```
backend/src/emails/
├── welcome.mjml                 # Registration welcome
├── otp.mjml                     # Email verification
├── order-confirmation.mjml      # Order receipt
└── password-reset.mjml          # Password reset
```

**They're automatically used when:**
- User registers → `sendWelcomeEmail()`
- User verifies email → `sendOtpEmail()`
- Order placed → `sendOrderConfirmationEmail()`
- Password reset requested → `sendPasswordResetEmail()`

**No action needed** - Email service is already updated to use these templates.

---

## Step 2: Set Up Sanity CMS

### 2.1 Create Sanity Project

```bash
# Install Sanity CLI
npm install -g @sanity/cli

# From repo root, navigate to Sanity folder
cd sanity

# Initialize Sanity project
sanity init
```

Follow the prompts:
- Create new project
- Name: `nestmart-cms`
- Dataset: `production`
- Templates: Choose "Blank schema"

### 2.2 Configure Environment Variables

**Backend (.env):**
```
SANITY_PROJECT_ID=your_sanity_project_id
SANITY_DATASET=production
SANITY_API_TOKEN=your_read_only_token
```

To get your tokens:
1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Select your project
3. API → Tokens → Add API token
4. Name: `NestMart Backend`
5. Permissions: **Read only**
6. Copy the token to `SANITY_API_TOKEN`

### 2.3 Deploy Sanity Studio

```bash
cd sanity
npm run build
npm run deploy
```

Your studio will be available at:
```
https://<your-project-id>.sanity.studio
```

---

## Step 3: Test CMS Endpoints

### Start Backend

```bash
cd backend
npm run dev
```

### Fetch Homepage Data

```bash
curl http://localhost:5000/api/cms/homepage
```

**Response:**
```json
{
  "settings": { ... },
  "banners": [ ... ],
  "featuredProducts": [ ... ]
}
```

### Available Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/cms/homepage` | All homepage data |
| `GET /api/cms/banners` | Active banners only |
| `GET /api/cms/blog?limit=10` | Blog posts |
| `GET /api/cms/blog/:slug` | Single blog post |
| `GET /api/cms/featured-products` | Featured sections |
| `GET /api/cms/settings` | Global settings |

---

## Step 4: Populate Content (Optional)

Go to your Sanity Studio and add test content:

1. **Create a Banner:**
   - Title: "Summer Sale"
   - Upload an image
   - Add CTA text: "Shop Now"
   - Toggle isActive: true

2. **Create a Blog Post:**
   - Title: "5 Home Decor Tips"
   - Write some content
   - Set as Published: true
   - System will auto-generate slug

3. **Create Featured Products:**
   - Title: "Best Sellers"
   - Add some product IDs (from MongoDB)
   - Toggle isActive: true

---

## Step 5: Test Email Templates (Optional)

### Trigger Welcome Email

Register a test account:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com", "password": "Test123!"}'
```

Check your console/logs or email for the welcome email.

### Trigger OTP Email

```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

Look for the OTP email with verification code.

---

## File Locations

**Phase 3D Components:**

```
backend/
├── src/
│   ├── emails/                              # MJML templates
│   │   ├── welcome.mjml
│   │   ├── otp.mjml
│   │   ├── order-confirmation.mjml
│   │   └── password-reset.mjml
│   ├── services/
│   │   ├── email-template.service.ts        # Template renderer
│   │   ├── email.service.ts                 # Updated with MJML
│   │   └── cms.service.ts                   # CMS logic + caching
│   ├── config/
│   │   └── sanity.ts                        # Sanity client
│   ├── controllers/
│   │   └── cms.controller.ts                # CMS endpoints
│   └── routes/
│       ├── cms.routes.ts                    # CMS routes
│       └── index.ts                         # Updated router
└── .env.example                             # Updated with SANITY vars

sanity/
├── schemas/
│   ├── banner.ts
│   ├── blog-post.ts
│   ├── featured-products.ts
│   ├── homepage-settings.ts
│   └── index.ts
├── sanity.config.ts                         # Main config
├── package.json                             # Sanity packages
├── tsconfig.json
└── README.md

Documentation/
├── PHASE_3D_IMPLEMENTATION.md               # Full guide
└── MILESTONE_3_COMPLETION.md                # Completion report
```

---

## Troubleshooting

### "Sanity API Token not found"
- Ensure `SANITY_API_TOKEN` is set in `.env`
- Token must have "Read only" permissions
- Check Sanity dashboard for token validity

### "Emails not rendering"
- Check `.env` has valid SMTP credentials
- If SMTP not configured, emails log to console
- Check logs for template rendering errors

### "CMS data not updating"
- CMS queries are cached for 5 minutes
- Call `clearCmsCache()` to invalidate
- Ensure document is published in Sanity

### "Sanity Studio 404"
- Run `npm run deploy` again
- Check deployment logs for errors
- Verify project ID is correct

---

## What's Included

✅ **4 Production-Ready Email Templates**
- Welcome email
- OTP email
- Order confirmation with itemized receipt
- Password reset email

✅ **Complete CMS Setup**
- 4 document schemas
- Sanity configuration
- Read-only API integration

✅ **Backend Integration**
- Email rendering service
- CMS service with caching
- 6 new API endpoints
- Error handling & logging

✅ **Documentation**
- Full implementation guide
- Completion report
- API endpoint documentation

---

## Next: Milestone 4 (QA & Launch)

After Phase 3D:
1. Test email delivery via SMTP
2. Populate CMS with 3-5 test items
3. Verify page performance (Lighthouse)
4. Run end-to-end tests for payments
5. Deploy to production

See `PHASE_3D_IMPLEMENTATION.md` for detailed testing procedures.

---

**Phase 3D Status: ✅ Complete**  
**Ready for Staging Deployment**
