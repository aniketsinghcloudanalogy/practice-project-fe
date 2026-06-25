"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Navbar from "./Navbar";

type Props = {
  children: ReactNode;
};

const HIDE_ON = ["/login", "/signup"];
const APP_SHELL_SEGMENTS = new Set([
  "/admin",
  "/superAdminPartner",
  "/formBuilder",
  "/adminPartner",
  "/dealRegAi",
  "/dashboard",
  "/hottables",
  "/pdf",
  "/quote",
  "/contact",
]);

const isLocaleSegment = (segment: string) => /^[a-z]{2}(-[A-Z]{2})?$/.test(segment);

const startsInShell = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return false;
  }

  const first = `/${segments[0]}`;
  if (APP_SHELL_SEGMENTS.has(first)) {
    return true;
  }

  if (isLocaleSegment(segments[0]) && segments[1]) {
    const second = `/${segments[1]}`;
    return APP_SHELL_SEGMENTS.has(second);
  }

  return false;
};

const isAuthPage = (pathname: string) => {
  if (HIDE_ON.includes(pathname)) {
    return true;
  }

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length >= 2 && isLocaleSegment(segments[0])) {
    const localePath = `/${segments[1]}`;
    return HIDE_ON.includes(localePath);
  }

  return false;
};

export default function NavbarGuard({ children }: Props) {
  const pathname = usePathname() ?? "/";

  const hideNavbar = isAuthPage(pathname) || startsInShell(pathname);

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
