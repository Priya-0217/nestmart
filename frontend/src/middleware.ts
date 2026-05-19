import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";
import { USER_ROLES } from "@/lib/constants/roles";
import { isAdminPanelRole } from "@/app/admin/components/admin-rbac";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ?? "dev-nextauth-secret-change-me-please";
const PUBLIC_ADMIN_PATHS = ["/admin/login"];

export default withAuth({
  secret: NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login"
  },
  callbacks: {
    authorized({ token, req }) {
      const pathname = (req as NextRequest).nextUrl.pathname;

      if (PUBLIC_ADMIN_PATHS.some((path) => pathname.startsWith(path))) return true;
      if (!token) return false;

      if (pathname.startsWith("/admin")) {
        return (
          token.role === USER_ROLES.ADMIN ||
          token.role === USER_ROLES.MANAGER ||
          token.role === USER_ROLES.SUPPORT ||
          isAdminPanelRole(token.role)
        );
      }

      return true;
    }
  }
});

export const config = {
  matcher: ["/checkout/:path*", "/account/:path*", "/admin/:path*"]
};
