"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Navbar from "./Navbar";

type Props = {
  children: ReactNode;
};

// Routes/sections that render their own header (DashboardHeader, AdminHeader, etc.)
const HIDDEN_PREFIXES = ["/login", "/signup", "/admin", "/superAdminPartner", "/dashboard"];

const shouldHideNavbar = (pathname: string) =>
  HIDDEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  const hideOn = ['/login', '/signup']
  const appShellPrefixes = ['/admin', '/superAdminPartner', '/formBuilder', '/dashboard', '/contact',"/adminPartner","/dealRegAi"]
  const shouldHide =
    hideOn.includes(pathname) ||
    appShellPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )

  return (
    <>
      {!hideNavbar && (
        <>
          <Navbar />
          <div className="shrink-0 pt-[var(--navbar-height)]" aria-hidden="true" />
        </>
      )}
      {children}
    </>
  );
}