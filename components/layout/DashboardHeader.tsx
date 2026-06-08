"use client";

import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { logout } from "@/lib/api/auth.api";
import { UserOutlined } from "@ant-design/icons";

const DashboardHeader = () => {
  const router = useRouter();
  const { data: session } = useSession();

  const handleLogout = async () => {
    const token = session?.accessToken ?? "";
    if (token) { try { await logout(token); } catch {} }
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-20 w-full border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between px-6 py-3">
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
          Dashboard
        </p>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <UserOutlined />
            <span>{session?.user?.name ?? session?.user?.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-100 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
