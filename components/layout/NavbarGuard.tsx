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

export default function NavbarGuard({ children }: Props) {
  const pathname = usePathname() ?? "";
  const hideNavbar = shouldHideNavbar(pathname);

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