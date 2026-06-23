"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { logout } from "@/lib/api/auth.api";
import {
  MdSettings,
  MdLogout,
  MdMenu,
  MdPeople,
  MdKeyboardArrowDown,
  MdDashboard,
  MdAdminPanelSettings,
} from "react-icons/md";
import { useSidebar } from "@/store/features/dashboard/sidebarContext";
import Button from "../common/antd/Button";

// Fallback avatar shown when the user has no profile image
const AdminAvatar = ({ size = 36 }: { size?: number }) => (
  <div
    style={{ width: size, height: size }}
    className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-sm"
  >
    <MdAdminPanelSettings size={Math.round(size * 0.55)} />
  </div>
);

const AdminHeader = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { openMobile } = useSidebar();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const role = session?.user?.role;
  const userImage = session?.user?.image;
  const displayName = session?.user?.name ?? "Admin User";
  const userEmail = session?.user?.email ?? "";

  // Get page context
  const getPageContext = () => {
    if (pathname?.includes('/adminPartner') || pathname?.includes('/superAdminPartner')) {
      return {
        title: 'Partner Programs',
        subtitle: 'Manage partner programs and forms',
        icon: <MdPeople className="text-xl text-violet-700" />,
        href: role === 'SUPER_ADMIN' ? '/superAdminPartner' : '/adminPartner'
      };
    }
    if (pathname?.includes('/dealRegAi')) {
      return {
        title: 'DealRegAi',
        subtitle: 'AI-powered deal registration',
        icon: <MdDashboard className="text-xl text-violet-700" />,
        href: '/dealRegAi'
      };
    }
    // Default to dashboard
    return {
      title: 'Admin Panel',
      subtitle: 'Management Dashboard',
      icon: <MdSettings className="text-xl text-violet-700" />,
      href: '/admin'
    };
  };

  const pageContext = getPageContext();

  const handleLogout = async () => {
    const token = session?.accessToken ?? "";

    if (token) {
      try {
        await logout(token);
      } catch (error) {
        console.error(error);
      }
    }

    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-[var(--navbar-height)] border-b border-slate-200 bg-white shadow-sm">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        {/* Left */}
        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <Button
              variant="secondary"
              onClick={openMobile}
              aria-label="Open navigation"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
            >
              <MdMenu size={20} />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
              {pageContext.icon}
            </div>

            <div>
              <Link
                href={pageContext.href}
                className="block text-lg font-semibold text-slate-900"
              >
                {pageContext.title}
              </Link>

              <p className="text-xs text-slate-500">
                {pageContext.subtitle}
              </p>
            </div>
          </div>

          <span className="hidden rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700 lg:inline-flex">
            {role}
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Desktop user info */}
          <div className="hidden items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 md:flex">
            {userImage ? (
              <Image
                src={userImage}
                alt={displayName}
                width={36}
                height={36}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <AdminAvatar size={36} />
            )}

            <div className="max-w-[180px]">
              <p className="truncate text-sm font-medium text-slate-900">
                {displayName}
              </p>

              <p className="truncate text-xs text-slate-500">{userEmail}</p>
            </div>
          </div>

          {/* Mobile avatar dropdown */}
          <div ref={dropdownRef} className="relative md:hidden">
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={dropdownOpen}
              className="flex items-center gap-1 rounded-full p-0.5 transition hover:bg-slate-100"
            >
              {userImage ? (
                <Image
                  src={userImage}
                  alt={displayName}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <AdminAvatar size={36} />
              )}

              <MdKeyboardArrowDown
                size={18}
                className={`text-slate-500 transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {dropdownOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
              >
                <div className="flex items-center gap-3 border-b px-4 py-3">
                  {userImage ? (
                    <Image
                      src={userImage}
                      alt={displayName}
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <AdminAvatar size={36} />
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-slate-500">{userEmail}</p>
                  </div>
                </div>

                {role && (
                  <div className="px-4 py-2.5">
                    <span className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">
                      {role}
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 border-t px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <MdLogout size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Desktop logout */}
          <Button
            variant="danger"
            onClick={handleLogout}
            className="hidden items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium md:flex"
          >
            <MdLogout size={18} />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;