# NestMart Milestone 2 Starter

This repository is organized into two separate folders as requested:

- `frontend/` → Next.js 14 + React + TypeScript + Tailwind CSS + Framer Motion
- `backend/` → Node.js + Express.js REST API

## Quick Start

### 1) Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:3000`.

### 2) Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Runs on `http://localhost:5000`.

## Milestone 2 coverage

- Animated, visually attractive UI with gradients, shadows, hover motion, and scroll-in animations.
- Core pages scaffolded: homepage, product listing, cart, account dashboard.
- Reusable UI components: navbar, hero, product cards, animation shell.
- REST API starter: health endpoint + products endpoints.

## API endpoints

- `GET /api/health`
- `GET /api/products`
- `GET /api/products/:id`
