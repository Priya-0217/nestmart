import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { USER_ROLES } from "@/lib/constants/roles";
import type { UserRole } from "@/lib/constants/roles";
import { authApi } from "@/lib/api";

type GoogleProfile = {
  sub?: string;
  email?: string;
  name?: string | null;
  picture?: string | null;
  email_verified?: boolean | null;
};

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days to match refresh token
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      name: "NestMart Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        try {
          const response = await authApi.login({
            email: credentials.email,
            password: credentials.password,
          });

          return {
            id: response.user.id,
            email: response.user.email,
            name: response.user.name,
            role: response.user.role,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          };
        } catch {
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        const googleProfile = profile as GoogleProfile | undefined;
        if (!googleProfile?.sub || !googleProfile.email) {
          return '/auth/login?error=InvalidGoogleProfile';
        }

        let intent: 'login' | 'register' | undefined;
        try {
          // Use dynamic import to avoid issues in non-request contexts
          const { cookies } = await import('next/headers');
          const cookieStore = cookies();
          const cookieValue = cookieStore.get('auth_intent')?.value;
          if (cookieValue === 'login' || cookieValue === 'register') {
            intent = cookieValue;
          }
        } catch (e) {
          console.warn('NextAuth signIn: Could not read auth_intent from cookies(). This is expected if not in a request context.', e);
        }

        try {
          const response = await authApi.googleLogin({
            idToken: account?.id_token || undefined,
            profile: {
              sub: String(googleProfile.sub),
              email: String(googleProfile.email),
              name: googleProfile.name ? String(googleProfile.name) : undefined,
              picture: googleProfile.picture ? String(googleProfile.picture) : undefined,
              email_verified: typeof googleProfile.email_verified === 'boolean' ? googleProfile.email_verified : undefined,
            },
            intent: intent || undefined,
          });

          // Set backend cookies on the frontend domain as well
          // This allows the browser to send them to the backend in subsequent requests
          try {
            const { cookies } = await import('next/headers');
            const cookieStore = cookies();
            const isAdmin = response.user.role === 'admin' || response.user.role === 'manager' || response.user.role === 'support';
            const accessKey = isAdmin ? 'adminAccessToken' : 'accessToken';
            const refreshKey = isAdmin ? 'adminRefreshToken' : 'refreshToken';
            
            cookieStore.set(accessKey, response.accessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
              maxAge: 15 * 60,
            });
            cookieStore.set(refreshKey, response.refreshToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
              maxAge: 7 * 24 * 60 * 60,
            });
          } catch (e) {
            console.warn('NextAuth signIn: Could not set backend cookies in Google flow.', e);
          }

          // Mutate the account object instead of the user object.
          (account as any).backendUserId = response.user.id;
          (account as any).accessToken = response.accessToken;
          (account as any).refreshToken = response.refreshToken;
          (account as any).role = response.user.role;
          
          return true;
        } catch (error) {
          console.error('Failed to sync Google login to backend:', error);
          const message = error instanceof Error ? error.message : 'Failed to complete Google sign-in.';
          // Return the error message as a query param to the login page
          return `/auth/login?error=${encodeURIComponent(message)}`;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // First sign in (Credentials or OAuth)
      if (account && user) {
        return {
          ...token,
          accessToken: (user as any).accessToken || (account as any).accessToken,
          refreshToken: (user as any).refreshToken || (account as any).refreshToken,
          backendUserId: (user as any).id || (account as any).backendUserId,
          role: (user as any).role || (account as any).role,
          expiresAt: Math.floor(Date.now() / 1000) + 15 * 60,
        };
      }

      // Return previous token if the access token has not expired yet
      if (token.expiresAt && Date.now() < (token.expiresAt as number) * 1000) {
        return token;
      }

      // Access token has expired, try to update it
      try {
        const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const normalizedApiUrl = rawApiUrl
          .trim()
          .replace(/^['\"]|['\"]$/g, "")
          .replace(/\/+$/, "");
        const refreshUrl = normalizedApiUrl.endsWith("/api")
          ? `${normalizedApiUrl}/auth/refresh`
          : `${normalizedApiUrl}/api/auth/refresh`;
        const response = await fetch(refreshUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: token.refreshToken }),
        });

        const tokens = await response.json();

        if (!response.ok) throw tokens;

        return {
          ...token,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken ?? token.refreshToken,
          expiresAt: Math.floor(Date.now() / 1000) + 15 * 60,
        };
      } catch (error) {
        console.error("Error refreshing access token", error);
        return { ...token, error: "RefreshAccessTokenError" };
      }
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.backendUserId as string) ?? (token.sub as string) ?? "";
        session.user.role = (token.role as UserRole | undefined) ?? USER_ROLES.CUSTOMER;
        session.accessToken = token.accessToken as string | undefined;
        session.refreshToken = token.refreshToken as string | undefined;
        (session as any).error = token.error;
      }
      return session;
    },
  },
};
