import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

type Role = (typeof ROLES)[keyof typeof ROLES];

const HOME_BY_ROLE: Record<Role, string> = {
  [ROLES.USER]: "/dashboard",
  [ROLES.ADMIN]: "/admin",
  [ROLES.SUPER_ADMIN]: "/admin",
};

type RouteAccessRule = {
  path: string;
  allowedRoles: Role[];
};

/**
 * Route access rules. Put more specific paths before broader ones if they share a prefix.
 */
const ROUTE_ACCESS: RouteAccessRule[] = [
  {
    path: "/formBuilder",
    allowedRoles: [ROLES.SUPER_ADMIN],
  },
  {
    path: "/superAdminPartner",
    allowedRoles: [ROLES.SUPER_ADMIN],
  },
  {
    path: "/adminPartner",
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: "/dealRegAi",
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: "/admin",
    allowedRoles: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
  },
  {
    path: "/dashboard",
    allowedRoles: [ROLES.USER],
  },
  {
    path: "/hottables",
    allowedRoles: [ROLES.USER],
  },
  {
    path: "/pdf",
    allowedRoles: [ROLES.USER],
  },
  {
    path: "/contact",
    allowedRoles: [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN],
  },
];

function getRoleFromToken(token: unknown): Role | undefined {
  if (!token || typeof token !== "object") return undefined;

  const role = (token as { user?: { role?: string } }).user?.role;

  if (role === ROLES.USER || role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN) {
    return role;
  }

  return undefined;
}

function findRouteAccessRule(pathname: string): RouteAccessRule | undefined {
  return ROUTE_ACCESS.find(
    (rule) => pathname === rule.path || pathname.startsWith(`${rule.path}/`),
  );
}

function isRoleAllowedForPath(pathname: string, role: Role | undefined): boolean {
  const rule = findRouteAccessRule(pathname);

  if (!rule) return true;

  if (!role) return false;

  return rule.allowedRoles.includes(role);
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = getRoleFromToken(req.nextauth.token);
    const rule = findRouteAccessRule(pathname);

    if (rule && !isRoleAllowedForPath(pathname, role)) {
      const redirectTo = role ? HOME_BY_ROLE[role] : "/login";
      return NextResponse.redirect(new URL(redirectTo, req.url));
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
  },
);

export const config = {
  matcher: [
    "/formBuilder/:path*",
    "/superAdminPartner/:path*",
    "/adminPartner/:path*",
    "/dealRegAi/:path*",
    "/admin/:path*",
    "/dashboard/:path*",
    "/hottables/:path*",
    "/pdf/:path*",
    "/contact/:path*",
  ],
};
