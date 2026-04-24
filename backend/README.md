# NestMart Backend API

Express + TypeScript + MVC. MongoDB (via Mongoose) for catalog/orders, PostgreSQL (via Prisma) for identity/auth.

## Quick start

```bash
# 1. From repo root: bring up local Mongo + Postgres
docker compose up -d

# 2. Install deps and configure env
cd backend
npm install
cp .env.example .env

# 3. Generate Prisma client + run migrations against local Postgres
npm run prisma:generate
npm run prisma:migrate    # creates initial migration + applies it

# 4. Run the API
npm run dev               # tsx watch, auto-reload
# -> http://localhost:5000/api/health
```

## Project layout

```
backend/
  prisma/
    schema.prisma           Postgres schema (users, sessions, addresses, auth tokens)
  src/
    app.ts                  Express app factory (helmet, cors, pino-http, rate limit, routers)
    server.ts               Boot: connect Mongo + Postgres, start HTTP, wire shutdown
    config/
      env.ts                Zod-validated env loader
      logger.ts             Pino logger (pretty in dev)
      mongo.ts              Mongoose connection
      prisma.ts             Prisma client singleton
    middleware/
      auth.ts               requireAuth / optionalAuth (JWT Bearer)
      rbac.ts               requireRole('admin', ...)
      validate.ts           Zod schema validation (body/query/params)
      error-handler.ts      Central error translator (AppError, ZodError)
      rate-limit.ts         auth / payment / general rate limiters
    models/                 Mongoose models (product, category, cart, order, coupon, review, wishlist)
    routes/                 Express routers (one per resource)
      webhooks/             Stripe + Razorpay (raw-body mounted before express.json)
    controllers/            Thin HTTP adapters — delegate to services
    services/               Business logic (no req/res imports)
    validators/             Zod schemas per resource
    utils/                  errors, async-handler, pagination, token helpers
```

## NPM scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | tsx watch mode |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run compiled bundle |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run prisma:generate` | Regenerate the Prisma client |
| `npm run prisma:migrate` | Apply dev migrations to Postgres |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run seed` | Seed script (Phase 3A stub at `src/scripts/seed.ts`) |
| `npm test` | Vitest |

## Environment variables

See [.env.example](./.env.example). Every var has an inline comment describing what it is, the local default, and where to get the production value.

The quick version:

| Category | Variables | Notes |
| --- | --- | --- |
| Runtime | `NODE_ENV`, `PORT`, `CLIENT_ORIGIN` | CORS is locked to `CLIENT_ORIGIN` |
| Databases | `MONGODB_URI`, `DATABASE_URL` | docker-compose gives both locally |
| JWT | `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL` | `openssl rand -hex 32` for secrets |
| Passwords | `BCRYPT_COST` | ≥ 12 |
| SMTP | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | Mailtrap for staging |
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` | [getting keys](#how-to-get-stripe-test-keys) |
| Razorpay | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | [getting keys](#how-to-get-razorpay-test-keys) |
| Google OAuth | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | [setup](#how-to-create-a-google-oauth-client) |
| Feature flags | `COD_ENABLED` | admin-toggleable cash-on-delivery |
| Logging | `LOG_LEVEL` | |

## REST API

The complete collection is at [../docs/nestmart.postman_collection.json](../docs/nestmart.postman_collection.json). Import into Postman, set the `baseUrl` variable, and run the `Auth > Register` → `Auth > Verify OTP` → `Auth > Login` flow to populate `accessToken` for everything else.

Top-level mounts:

- `GET  /api/health` / `GET /api/health/ready`
- `POST /api/auth/{register,verify-otp,login,refresh,logout,forgot-password,reset-password}`
- `GET  /api/products` (search, filter, sort, paginate) + full CRUD (admin)
- `GET  /api/products/:id/related`
- `GET  /api/categories` (tree) + CRUD (admin)
- `/api/cart` + `/api/cart/coupon` (auth)
- `/api/orders` (create, list, get, cancel, return) + `/api/orders/admin` + `/api/orders/:id/status`
- `/api/users/me` (profile, addresses, wishlist) (auth)
- `/api/reviews` (create, list, moderate)
- `/api/coupons` (validate + admin CRUD)
- `/api/admin/{stats, inventory-alerts, users, products/bulk, orders/bulk-status}`
- `/api/payments/*` (Phase 3C) + `/api/webhooks/{stripe,razorpay}` (Phase 3C)

## How to get Stripe test keys

1. Sign up at [dashboard.stripe.com](https://dashboard.stripe.com).
2. Make sure the top-left toggle says **Test mode**.
3. Go to **Developers → API keys**. Copy:
   - **Publishable key** (starts with `pk_test_`) → `STRIPE_PUBLISHABLE_KEY` + frontend `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
   - **Secret key** (starts with `sk_test_`) → `STRIPE_SECRET_KEY`.
4. For local webhooks, install the Stripe CLI and run:
   ```bash
   stripe listen --forward-to localhost:5000/api/webhooks/stripe
   ```
   Copy the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET`.

## How to get Razorpay test keys

1. Sign up at [dashboard.razorpay.com](https://dashboard.razorpay.com).
2. Toggle **Test Mode** (top-right).
3. **Account & Settings → API Keys → Generate Test Key**.
   - Key ID (`rzp_test_...`) → `RAZORPAY_KEY_ID` + frontend `NEXT_PUBLIC_RAZORPAY_KEY_ID`.
   - Key Secret → `RAZORPAY_KEY_SECRET`.
4. For webhooks: **Account & Settings → Webhooks → Create**. URL: `https://<your-api>/api/webhooks/razorpay`. Events: `payment.captured`, `payment.failed`, `refund.processed`. Copy the secret shown → `RAZORPAY_WEBHOOK_SECRET`.

## How to create a Google OAuth client

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → select or create a project.
2. **APIs & Services → OAuth consent screen**: set External, add your app name, add the Gmail account as a test user.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID → Web application**.
4. Authorised redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://<frontend-domain>/api/auth/callback/google`
5. Copy the client ID + secret into both `backend/.env` (for the API when/if it calls Google directly) and `frontend/.env.local` (for NextAuth's Google provider).

## Observability

- **Logs** — pino, pretty in dev, JSON in production. Requests are auto-logged via `pino-http` including status, duration, `req.id`.
- **Ready probe** — `GET /api/health/ready` pings Mongo + Postgres. Use this for platform health checks.

## Roadmap (what's still stubbed)

- **Phase 3B**: NextAuth on frontend + Google OAuth provider wiring. Current auth endpoints work end-to-end; OAuth just needs the Google handler.
- **Phase 3C**: Stripe Payment Intents + Razorpay order creation, webhook handlers (signature verification already wired for raw-body mounting), COD finalization.
- **Phase 3D**: MJML-rendered email templates + Sanity Studio + ISR-backed CMS pages.
