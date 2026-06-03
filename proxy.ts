import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const role = (req.nextauth.token?.user as any)?.role as string | undefined

    // ADMIN can't visit /dashboard, redirect to /admin
    if (pathname.startsWith("/dashboard") && role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url))
    }

    // USER can't visit /admin, redirect to /dashboard
    if (pathname.startsWith("/admin") && role === "USER") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = { matcher: ["/dashboard(.*)", "/admin(.*)"] }
