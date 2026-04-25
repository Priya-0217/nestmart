import type { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

interface BackendUser {
  id: string;
  email: string;
  name: string | null;
  role: 'customer' | 'manager' | 'admin';
  emailVerified: boolean;
  avatarUrl: string | null;
}

interface BackendLoginResponse {
  user: BackendUser;
  accessToken: string;
  refreshToken: string;
}

const ACCESS_TTL_MS = 15 * 60 * 1000;

async function backendLogin(path: string, body: Record<string, unknown>): Promise<BackendLoginResponse | null> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) return null;
  return (await res.json()) as BackendLoginResponse;
}

async function backendRefresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { accessToken: string; refreshToken: string };
  return data;
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login'
  },
  providers: [
    CredentialsProvider({
      name: 'NestMart',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const data = await backendLogin('/api/auth/login', {
          email: credentials.email,
          password: credentials.password
        });
        if (!data) return null;
        // NextAuth merges anything we return into the JWT via the jwt callback.
        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name ?? undefined,
          image: data.user.avatarUrl ?? undefined,
          role: data.user.role,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken
        } satisfies NextAuthUser & {
          role: BackendUser['role'];
          accessToken: string;
          refreshToken: string;
        };
      }
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: { params: { scope: 'openid email profile' } }
          })
        ]
      : [])
  ],
  callbacks: {
    async signIn({ account }) {
      // Credentials provider returns the merged user from authorize() — let it through.
      if (account?.provider === 'credentials') return true;
      // Google: the id_token is exchanged on /api/auth/google in the jwt callback below.
      return account?.provider === 'google';
    },
    async jwt({ token, user, account }) {
      // Initial sign-in from the credentials provider.
      if (user && (user as { accessToken?: string }).accessToken) {
        const u = user as NextAuthUser & {
          role: BackendUser['role'];
          accessToken: string;
          refreshToken: string;
        };
        token.userId = u.id;
        token.role = u.role;
        token.accessToken = u.accessToken;
        token.refreshToken = u.refreshToken;
        token.accessTokenExpiresAt = Date.now() + ACCESS_TTL_MS;
        return token;
      }

      // Initial sign-in from Google: exchange id_token with our backend.
      if (account?.provider === 'google' && account.id_token) {
        const data = await backendLogin('/api/auth/google', { idToken: account.id_token });
        if (data) {
          token.userId = data.user.id;
          token.role = data.user.role;
          token.accessToken = data.accessToken;
          token.refreshToken = data.refreshToken;
          token.accessTokenExpiresAt = Date.now() + ACCESS_TTL_MS;
        }
        return token;
      }

      // Subsequent calls — refresh if access token is near expiry.
      const expiresAt = (token.accessTokenExpiresAt as number | undefined) ?? 0;
      const refreshToken = token.refreshToken as string | undefined;
      if (refreshToken && Date.now() > expiresAt - 30_000) {
        const refreshed = await backendRefresh(refreshToken);
        if (refreshed) {
          token.accessToken = refreshed.accessToken;
          token.refreshToken = refreshed.refreshToken;
          token.accessTokenExpiresAt = Date.now() + ACCESS_TTL_MS;
        } else {
          token.error = 'RefreshTokenRevoked';
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: (token.userId as string | undefined) ?? '',
        role: (token.role as BackendUser['role'] | undefined) ?? 'customer'
      };
      session.accessToken = token.accessToken as string | undefined;
      session.refreshToken = token.refreshToken as string | undefined;
      session.error = token.error as string | undefined;
      return session;
    }
  }
};
