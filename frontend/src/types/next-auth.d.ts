import "next-auth";
import "next-auth/jwt";
import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/lib/constants/roles";

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession['user'];
    accessToken?: string;
    refreshToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: UserRole;
    backendUserId?: string;
    accessToken?: string;
    refreshToken?: string;
  }
}
