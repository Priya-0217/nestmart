# NestMart

Production-grade e-commerce platform. Next.js 14 frontend, Express + TypeScript backend, Mongo + Postgres + Sanity.

| App | Stack | Path |
| --- | --- | --- |
| Frontend | Next.js 14 App Router, Tailwind, Zustand, Framer Motion | [`frontend/`](./frontend) |
| Backend API | Express + TypeScript, Mongoose, Prisma, Zod, pino | [`backend/`](./backend) |
| CMS | Sanity Studio (Phase 3D) | `studio/` — coming in Phase 3D |

---

## Run the full stack in under 5 minutes

**Prereqs:** Node 20+, npm, Docker Desktop.

```bash
# 1. Databases (Mongo 7 + Postgres 16)
docker compose up -d

# 2. Backend
cd backend
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate        # creates Postgres tables
npm run dev                   # http://localhost:5000

# 3. Frontend (new terminal)
cd frontend
npm install
cp .env.example .env.local
npm run dev                   # http://localhost:3000
```

Health check: `curl http://localhost:5000/api/health/ready` — both `mongo` and `postgres` should be `true`.

## Monorepo layout

```
nestmart/
  docker-compose.yml                local Mongo + Postgres
  docs/
    nestmart.postman_collection.json
    db-schema.md                    DBML for both stores
    email-templates/                rendered previews (Phase 3D)
  frontend/                         Next.js 14 app
  backend/                          Express API (TypeScript)
  studio/                           Sanity Studio (Phase 3D)
```

## Milestone 3 progress

- ✅ **Phase 3A — Backend API**: full MVC scaffold, Mongoose + Prisma schemas, every REST endpoint in the spec, Zod validation, centralized errors, pino logging, rate limiting, Postman collection, DBML schema doc.
- ✅ **Phase 3B — Authentication (partial)**: JWT access + refresh with rotation, bcrypt (cost ≥ 12), email OTP (6-digit, 10-min TTL), password-reset links (30-min, single-use), session revocation on logout + password change, `requireAuth` + `requireRole`. **NextAuth.js on frontend + Google OAuth provider land in Phase 3B's second half.**
- ⏳ **Phase 3C — Payments**: routes scaffolded with signature-safe raw-body mounting. Payment Intent and webhook logic land next.
- ⏳ **Phase 3D — Email & CMS**: basic Nodemailer dispatch + template scaffolds present. MJML templates, HTML previews, and Sanity Studio are next.

See [backend/README.md](./backend/README.md) for per-service docs and setup walkthroughs for Stripe, Razorpay, Google OAuth, and Mailtrap.

## Docs

- **API reference**: [docs/nestmart.postman_collection.json](./docs/nestmart.postman_collection.json) (import into Postman)
- **DB schema**: [docs/db-schema.md](./docs/db-schema.md) (paste the DBML block into [dbdiagram.io](https://dbdiagram.io))
- **Backend details**: [backend/README.md](./backend/README.md)

## License

Private / proprietary (NestMart internal).
