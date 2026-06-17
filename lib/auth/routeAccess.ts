import { ROLES, type Role } from "./roles";

export type RouteAccessRule = {
  /** URL prefix, e.g. `/superAdminPartner` */
  path: string;
  /** Roles that may open this route */
  allowedRoles: Role[];
};

/**
 * Route access rules.
 *
 * How to add a new protected route:
 * 1. Add an entry below with `path` and `allowedRoles`
 * 2. Add the same path to `PROXY_MATCHER`
 *
 * Put more specific paths before broader ones if they share a prefix.
 */
export const ROUTE_ACCESS: RouteAccessRule[] = [
  {
    path: "/formBuilder",
    allowedRoles: [ROLES.SUPER_ADMIN],
  },
  {
    path: "/superAdminPartner",
    allowedRoles: [ROLES.SUPER_ADMIN],
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
    path: "/contact",
    allowedRoles: [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN],
  },
];

/** Paths checked by `proxy.ts`. Keep in sync with `ROUTE_ACCESS`. */
export const PROXY_MATCHER = [
  "/formBuilder/:path*",
  "/superAdminPartner/:path*",
  "/admin/:path*",
  "/dashboard/:path*",
  "/contact/:path*",
];

export function findRouteAccessRule(pathname: string): RouteAccessRule | undefined {
  return ROUTE_ACCESS.find(
    (rule) => pathname === rule.path || pathname.startsWith(`${rule.path}/`),
  );
}

export function isRoleAllowedForPath(pathname: string, role: Role | undefined): boolean {
  const rule = findRouteAccessRule(pathname);

  // Path is not listed → no role restriction from this config
  if (!rule) return true;

  if (!role) return false;

  return rule.allowedRoles.includes(role);
}
