# NestMart Google OAuth Production Failure Report

Date: 2026-05-19

## 1) Authentication architecture (confirmed from code)

- Frontend uses NextAuth with Credentials and Google providers. See [frontend/src/lib/auth/options.ts](frontend/src/lib/auth/options.ts) and [frontend/src/app/api/auth/[...nextauth]/route.ts](frontend/src/app/api/auth/[...nextauth]/route.ts).
- Backend uses custom JWT access/refresh tokens with Prisma-backed sessions. See [backend/src/services/auth.service.ts](backend/src/services/auth.service.ts) and [backend/src/utils/tokens.ts](backend/src/utils/tokens.ts).
- Google OAuth is handled by NextAuth on the frontend. The backend only verifies a Google ID token (not a redirect-based Google flow). See [backend/src/services/auth.service.ts](backend/src/services/auth.service.ts).
- No Passport, Firebase Auth, or Google Identity Services SDK is used.

## 2) Full auth flow (step-by-step)

### Google OAuth flow

1. User clicks "Continue with Google" in the UI. See [frontend/src/features/auth/components/login-form.tsx](frontend/src/features/auth/components/login-form.tsx) and [frontend/src/features/auth/components/register-form.tsx](frontend/src/features/auth/components/register-form.tsx).
2. NextAuth starts the Google OAuth flow and redirects to Google.
3. Google redirects to the NextAuth callback at:
   - `https://www.nestmart.site/api/auth/callback/google`
   (This is derived from `NEXTAUTH_URL` and the provider configuration.)
4. NextAuth exchanges the code for tokens and calls the `signIn` callback. See [frontend/src/lib/auth/options.ts](frontend/src/lib/auth/options.ts).
5. The `signIn` callback posts the Google ID token and profile to the backend:
   - `POST https://nestmart-sy4h.onrender.com/api/auth/google`
   See [frontend/src/lib/auth/options.ts](frontend/src/lib/auth/options.ts) and [frontend/src/lib/api.ts](frontend/src/lib/api.ts).
6. The backend verifies the ID token using `GOOGLE_CLIENT_ID` as the audience, creates or links a user, then issues JWT access/refresh tokens. See [backend/src/services/auth.service.ts](backend/src/services/auth.service.ts).
7. The backend sets auth cookies and returns the JWTs. See [backend/src/controllers/auth.controller.ts](backend/src/controllers/auth.controller.ts).
8. NextAuth stores the JWTs in its session token and the user is redirected to the callback URL. See [frontend/src/lib/auth/options.ts](frontend/src/lib/auth/options.ts).

### Credentials flow (for comparison)

1. The login form calls the backend directly to set cookies in the browser.
2. NextAuth `CredentialsProvider` signs in and stores the JWTs in the NextAuth session.
3. Subsequent API calls attach the Bearer token from the session. See [frontend/src/lib/api.ts](frontend/src/lib/api.ts).

## 3) Frontend auth implementation audit

- NextAuth config and Google provider: [frontend/src/lib/auth/options.ts](frontend/src/lib/auth/options.ts)
- NextAuth API route: [frontend/src/app/api/auth/[...nextauth]/route.ts](frontend/src/app/api/auth/[...nextauth]/route.ts)
- Auth API client and `NEXT_PUBLIC_API_URL` handling: [frontend/src/lib/api.ts](frontend/src/lib/api.ts)
- Middleware that relies on `NEXTAUTH_SECRET`: [frontend/src/middleware.ts](frontend/src/middleware.ts)
- Env placeholders showing localhost defaults: [frontend/.env.example](frontend/.env.example)

### Production-sensitive settings detected

- `NEXTAUTH_URL` controls the Google callback base URL. If this is wrong, Google redirects will fail.
- `NEXT_PUBLIC_API_URL` is used by both the client and the NextAuth server callback. In [frontend/src/lib/auth/options.ts](frontend/src/lib/auth/options.ts) it falls back to `http://localhost:5000` if missing, which will break production token refresh.

## 4) Backend auth implementation audit

- CORS and proxy configuration: [backend/src/app.ts](backend/src/app.ts)
- Cookie settings for auth tokens: [backend/src/controllers/auth.controller.ts](backend/src/controllers/auth.controller.ts)
- Google ID token verification: [backend/src/services/auth.service.ts](backend/src/services/auth.service.ts)
- Environment schema and defaults: [backend/src/config/env.ts](backend/src/config/env.ts)
- Env placeholders showing localhost defaults: [backend/.env.example](backend/.env.example)

### Production-sensitive settings detected

- CORS is configured with a single string origin. See [backend/src/app.ts](backend/src/app.ts).
- Cookies are `SameSite=None; Secure` only when `NODE_ENV=production`. See [backend/src/controllers/auth.controller.ts](backend/src/controllers/auth.controller.ts).

## 5) Exact production environment values required

These must match the deployed URLs exactly, with no trailing slashes.

### Frontend (Vercel)

- `NEXTAUTH_URL=https://www.nestmart.site`
- `NEXTAUTH_SECRET=<long-random-secret>`
- `NEXT_PUBLIC_API_URL=https://nestmart-sy4h.onrender.com`
- `NEXT_PUBLIC_SITE_URL=https://www.nestmart.site`
- `GOOGLE_CLIENT_ID=<prod-google-client-id>`
- `GOOGLE_CLIENT_SECRET=<prod-google-client-secret>`

### Backend (Render)

- `NODE_ENV=production`
- `CLIENT_ORIGIN=https://www.nestmart.site`
- `GOOGLE_CLIENT_ID=<prod-google-client-id>`
- `GOOGLE_CLIENT_SECRET=<prod-google-client-secret>`
- `JWT_ACCESS_SECRET=<long-random-secret>`
- `JWT_REFRESH_SECRET=<long-random-secret>`

Important: `GOOGLE_CLIENT_ID` must be the same on both frontend and backend because the backend verifies the Google ID token against its audience. See [backend/src/services/auth.service.ts](backend/src/services/auth.service.ts).

## 6) Required Google OAuth Console values

These must match the NextAuth callback exactly.

### Authorized JavaScript origins

- `https://www.nestmart.site`

(Optional if you intend to serve both domains)
- `https://nestmart.site`

### Authorized redirect URIs

- `https://www.nestmart.site/api/auth/callback/google`

(Optional if you intend to serve both domains)
- `https://nestmart.site/api/auth/callback/google`

Local development (if needed):
- `http://localhost:3000`
- `http://localhost:3000/api/auth/callback/google`

## 7) Exact root cause(s) found

These are the only production-specific breakpoints visible in the code:

1) Domain mismatch for the Google callback
- NextAuth builds the Google callback from `NEXTAUTH_URL`. If this is set to `https://nestmart.site` while users are on `https://www.nestmart.site`, Google will reject the redirect with `redirect_uri_mismatch`.
- This is a direct mismatch between the runtime domain and the Google Console redirect URI. See [frontend/src/lib/auth/options.ts](frontend/src/lib/auth/options.ts).

2) Backend Google client ID mismatch or missing
- The backend verifies ID tokens with `audience: env.GOOGLE_CLIENT_ID`. If the backend is missing this value or it points to a different OAuth client than the frontend, verification fails and Google login is rejected with `Invalid Google token`.
- This only appears in production if the backend environment is not aligned with the frontend. See [backend/src/services/auth.service.ts](backend/src/services/auth.service.ts).

3) CORS origin not matching the actual frontend origin
- CORS is locked to a single string `env.CLIENT_ORIGIN`. If you configured it as a comma-separated list (for example `https://www.nestmart.site,https://nestmart.site`) or with a trailing slash, it will not match and the browser will block requests.
- This breaks the post-login API calls and cookie-based auth even if the Google flow completes.
- See [backend/src/app.ts](backend/src/app.ts) and [backend/.env.example](backend/.env.example).

## 8) Exact fixes

### Fix A: Set correct production env values (required)

Set the values exactly as listed in section 5. The top two that usually break Google OAuth are:

- `NEXTAUTH_URL=https://www.nestmart.site`
- Backend `GOOGLE_CLIENT_ID` must match the frontend `GOOGLE_CLIENT_ID`

### Fix B: CORS should support multiple origins (optional but recommended)

If you need both `www` and non-`www` domains, update the CORS config.

Current code (single origin) in [backend/src/app.ts](backend/src/app.ts):

```ts
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
```

Suggested fix:

```ts
const rawOrigins = env.CLIENT_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (rawOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));
```

### Fix C: Avoid localhost fallback in production refresh

In [frontend/src/lib/auth/options.ts](frontend/src/lib/auth/options.ts), the refresh call falls back to `http://localhost:5000` if `NEXT_PUBLIC_API_URL` is missing. This can break production refresh in the NextAuth server callback.

Suggested fix (reuse the same logic as [frontend/src/lib/api.ts](frontend/src/lib/api.ts)):

```ts
const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://nestmart-sy4h.onrender.com').replace(/\/+$/, '');
```

## 9) Simulated production flow and failure points

- Google redirects to `https://www.nestmart.site/api/auth/callback/google`.
  - If `NEXTAUTH_URL` or Google Console redirect URI does not match exactly, the flow fails immediately with `redirect_uri_mismatch`.
- NextAuth posts ID token to `https://nestmart-sy4h.onrender.com/api/auth/google`.
  - If backend `GOOGLE_CLIENT_ID` is missing or wrong, `verifyIdToken` fails with `Invalid Google token`.
- Browser makes API calls after sign-in.
  - If `CLIENT_ORIGIN` does not match the exact frontend origin, the browser blocks requests due to CORS, which looks like "login succeeded but session does not stick".

## 10) Render production checks

- `app.set("trust proxy", 1)` is already configured. See [backend/src/app.ts](backend/src/app.ts).
- Ensure `NODE_ENV=production` so auth cookies are `SameSite=None; Secure` for cross-site requests. See [backend/src/controllers/auth.controller.ts](backend/src/controllers/auth.controller.ts).
- Free-tier cold starts can cause timeouts on the first login attempt. This does not cause redirect mismatch but can manifest as intermittent login failures.

## 11) Security issues found

- `NEXTAUTH_SECRET` defaults to a hardcoded dev value if missing. This is insecure in production and can cause session verification failures in middleware. See [frontend/src/middleware.ts](frontend/src/middleware.ts).

## 12) Final correct OAuth flow (after fixes)

1. User clicks Google sign-in.
2. Google redirects to `https://www.nestmart.site/api/auth/callback/google`.
3. NextAuth exchanges the code and calls backend `POST https://nestmart-sy4h.onrender.com/api/auth/google`.
4. Backend verifies the ID token against the same `GOOGLE_CLIENT_ID`, issues JWTs, and responds.
5. NextAuth stores JWTs in its session token and redirects back to the app.
6. Frontend API calls include the Bearer token from the session and CORS allows the origin.

---

If you want me to apply the CORS fix and the refresh fallback fix directly in code, tell me and I will patch the files.