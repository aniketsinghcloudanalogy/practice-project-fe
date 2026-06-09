"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { logout } from "@/lib/api/auth.api";
import {
  MdSettings,
  MdPerson,
  MdLogout,
  MdDashboard,
  MdMenu,
} from "react-icons/md";
import { useSidebar } from "@/store/features/dashboard/sidebarContext";
import Button from "../common/Button";

const AdminHeader = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { openMobile } = useSidebar();

  const role = session?.user?.role;

  const handleLogout = async () => {
    const token = session?.accessToken ?? "";

    if (token) {
      try {
        await logout(token);
      } catch {}
    }

    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

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
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 "
          >
            <MdMenu size={20} />
          </Button>
</div> 
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
              <MdSettings className="text-xl text-violet-700" />
            </div>

            <div>
              <Link
                href="/admin"
                className="block text-lg font-semibold text-slate-900"
              >
                Admin Panel
              </Link>

              <p className="text-xs text-slate-500">
                Management Dashboard
              </p>
            </div>
          </div>

          <span className="hidden rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700 lg:inline-flex">
            {role}
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {role === "SUPER_ADMIN" && (
            <Link
              href="/admin"
              className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 md:flex"
            >
              <MdDashboard size={18} />
              Dashboard
            </Link>
          )}

          <div className="hidden items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 md:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
              <MdPerson className="text-slate-600" size={18} />
            </div>

            <div className="max-w-[180px]">
              <p className="truncate text-sm font-medium text-slate-900">
                {session?.user?.name ?? "Admin User"}
              </p>

              <p className="truncate text-xs text-slate-500">
                {session?.user?.email}
              </p>
            </div>
          </div>

          <Button
            variant="danger"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
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