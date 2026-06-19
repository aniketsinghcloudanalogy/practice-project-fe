"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";

import {
  MdMenu,
  MdNotificationsNone,
  MdKeyboardArrowDown,
  MdPerson,
  MdSettings,
  MdLogout,
  MdAdminPanelSettings,
} from "react-icons/md";

import { LuLayoutDashboard } from "react-icons/lu";

import { logout } from "@/lib/api/auth.api";
import { useSidebar } from "@/store/features/dashboard/sidebarContext";

// Fallback avatar shown when the user has no profile image
const AdminAvatar = ({ size = 40 }: { size?: number }) => (
  <div
    style={{ width: size, height: size }}
    className="flex shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-white shadow-sm"
  >
    <MdAdminPanelSettings size={Math.round(size * 0.55)} />
  </div>
);

const DashboardHeader = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { openMobile } = useSidebar();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const displayName = session?.user?.name || session?.user?.email || "User";
  const userEmail = session?.user?.email || "";
  const userImage = session?.user?.image;

  const handleLogout = useCallback(async () => {
    try {
      // remove if your API logout is not needed
      await logout("");
    } catch (error) {
      console.error(error);
    }

    await signOut({ redirect: false });

    router.push("/login");
    router.refresh();
  }, [router]);

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
    <header className="fixed inset-x-0 top-0 z-40 h-(--navbar-height) w-full border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="flex h-full w-full items-center justify-between px-3 sm:px-6">

        {/* Left — hamburger (mobile) + title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={openMobile}
            aria-label="Open sidebar menu"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          >
            <MdMenu size={24} />
          </button>

          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <LuLayoutDashboard size={20} />
            </div>

            <div>
              <h1 className="text-sm font-semibold text-slate-900">
                Dashboard
              </h1>
              <p className="hidden text-xs text-slate-500 sm:block">
                Admin Panel
              </p>
            </div>
          </Link>
        </div>

        {/* Right — user + logout */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden items-center gap-1.5 text-sm text-slate-600 sm:flex">
            <MdPerson size={16} />
            <span className="max-w-30 truncate">
              {session?.user?.name ?? session?.user?.email}
            </span>
          </div>

          <button
            type="button"
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Notifications"
          >
            <MdNotificationsNone size={24} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={dropdownOpen}
              className="flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-slate-100"
            >
              {userImage ? (
                <Image
                  src={userImage}
                  alt={displayName}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <AdminAvatar size={40} />
              )}

              <div className="hidden text-left sm:block">
                <p className="max-w-35 truncate text-sm font-medium">
                  {displayName}
                </p>
                <p className="text-xs text-slate-500">Admin</p>
              </div>

              <MdKeyboardArrowDown
                size={20}
                className={`hidden sm:block transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {dropdownOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
              >
                <div className="flex items-center gap-3 border-b px-4 py-3">
                  {userImage ? (
                    <Image
                      src={userImage}
                      alt={displayName}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <AdminAvatar size={32} />
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{displayName}</p>
                    <p className="truncate text-xs text-slate-500">{userEmail}</p>
                  </div>
                </div>

                <Link
                  href="/profile"
                  role="menuitem"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50"
                >
                  <MdPerson size={18} />
                  Profile
                </Link>

                <Link
                  href="/settings"
                  role="menuitem"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50"
                >
                  <MdSettings size={18} />
                  Settings
                </Link>

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <MdLogout size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;