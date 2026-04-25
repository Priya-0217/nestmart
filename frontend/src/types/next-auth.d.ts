import type { DefaultSession } from 'next-auth';
import 'next-auth';
import 'next-auth/jwt';

type Role = 'customer' | 'manager' | 'admin';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    error?: string;
    user: {
      id: string;
      role: Role;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string;
    role?: Role;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresAt?: number;
    error?: string;
  }
}
