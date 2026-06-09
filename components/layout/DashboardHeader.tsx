"use client";

import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { logout } from "@/lib/api/auth.api";
import { MdPerson, MdLogout, MdMenu } from "react-icons/md";
import { useSidebar } from "@/store/features/dashboard/sidebarContext";

const DashboardHeader = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { openMobile } = useSidebar();

  const handleLogout = async () => {
    const token = session?.accessToken ?? "";
    if (token) { try { await logout(token); } catch {} }
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-[var(--navbar-height)] w-full border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="flex h-full w-full items-center justify-between px-3 sm:px-6">

        {/* Left — hamburger (mobile) + title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={openMobile}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 sm:hidden"
          >
            <MdMenu size={18} />
          </button>

          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
            Dashboard
          </p>
        </div>

        {/* Right — user + logout */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden items-center gap-1.5 text-sm text-slate-600 sm:flex">
            <MdPerson size={16} />
            <span className="max-w-[120px] truncate">
              {session?.user?.name ?? session?.user?.email}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100 sm:px-3 sm:text-sm"
          >
            <MdLogout size={15} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
