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

## Acceptance criteria

### Accessibility requirements

- All interactive elements are keyboard-navigable using `Tab` and activatable with `Enter` or `Space`.
- ARIA labels are present on all icon-only buttons, including cart, wishlist, and close controls.
- Body text color contrast ratio is at least 4.5:1 (WCAG AA).
- All focusable elements include a visible `:focus-visible` ring.
- Form fields have associated labels and are not placeholder-only.
- A skip-to-main-content link is present in the navbar/header.
- All product images define meaningful `alt` text.

## Animation spec (Framer Motion)

- Page transition: fade + slide up, duration `0.3s`, ease `easeOut`.
- Product card hover: `scale(1.02)` + elevated shadow, duration `0.2s`.
- Cart drawer: slide in from right, duration `0.35s`, spring transition.
- Toast notification: slide in from top-right, duration `0.25s`.
- Skeleton loader: shimmer animation with `1.5s` looping interval.
- Add-to-cart button: success pulse animation, duration `0.4s`.
- Hero banner: staggered fade-in with child delay `0.1s` per item.
- Reduced motion: when `prefers-reduced-motion` is enabled, disable all non-essential animations.

## API endpoints

- `GET /api/health`
- `GET /api/products`
- `GET /api/products/:id`
