import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

type Role = "USER" | "ADMIN" | "SUPER_ADMIN";

const ROUTE_ROLES = [
  { prefix: "/dashboard", allowed: ["USER"] as Role[] },
  { prefix: "/admin", allowed: ["ADMIN", "SUPER_ADMIN"] as Role[] },
  { prefix: "/partner", allowed: ["SUPER_ADMIN"] as Role[] },
  { prefix: "/contact", allowed: ["USER", "ADMIN", "SUPER_ADMIN"] as Role[] },
];

const REDIRECT: Record<Role, string> = {
  USER: "/dashboard",
  ADMIN: "/admin",
  SUPER_ADMIN: "/admin",
};

export default withAuth(
  function middleware(req) {
    const pathname = req.nextUrl.pathname;

    const role = req.nextauth.token?.role as Role | undefined;

    const route = ROUTE_ROLES.find((r) =>
      pathname.startsWith(r.prefix)
    );

    if (route && role && !route.allowed.includes(role)) {
      return NextResponse.redirect(
        new URL(REDIRECT[role], req.url)
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/partner/:path*",
    "/contact/:path*",
  ],
};