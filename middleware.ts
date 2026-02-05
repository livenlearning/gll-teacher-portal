import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";

export default withAuth(
  function middleware(req: NextRequest) {
    const token = (req as any).nextauth?.token;

    // Admin-only routes
    if (req.nextUrl.pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      const url = new URL("/dashboard", req.url);
      return Response.redirect(url);
    }
  },
  {
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      authorized({ token }) {
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/cohort/:path*", "/admin/:path*"],
};
