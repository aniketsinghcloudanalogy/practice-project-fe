import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = (req.nextauth.token?.user as any)?.role as string | undefined;
    const isAdminRole = role === "ADMIN" || role === "SUPER_ADMIN";

    // ADMIN / SUPER_ADMIN visiting /dashboard → redirect to /admin
    if (pathname.startsWith("/dashboard") && isAdminRole) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    // USER visiting /admin → redirect to /dashboard
    if (pathname.startsWith("/admin") && !isAdminRole) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
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
  matcher: ["/dashboard", "/admin"],
};
