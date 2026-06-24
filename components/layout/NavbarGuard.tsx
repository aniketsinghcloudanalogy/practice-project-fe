"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Navbar from "./Navbar";

type Props = {
  children: ReactNode;
};

const HIDE_ON = ["/login", "/signup"];
const APP_SHELL_PREFIXES = ["/admin", "/superAdminPartner", "/formBuilder",  "/adminPartner", "/dealRegAi"];

export default function NavbarGuard({ children }: Props) {
  const pathname = usePathname();

  const hideNavbar =
    HIDE_ON.includes(pathname) ||
    APP_SHELL_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );

  return (
    <>
      {!hideNavbar && (
        <>
          <Navbar />
          <div className="shrink-0 pt-(--navbar-height)" aria-hidden="true" />
        </>
      )}
      {children}
    </>
  );
}
