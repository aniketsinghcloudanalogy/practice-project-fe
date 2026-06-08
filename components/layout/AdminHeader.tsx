"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { logout } from "@/lib/api/auth.api";
import { UserOutlined, SettingOutlined } from "@ant-design/icons";

const AdminHeader = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const handleLogout = async () => {
    const token = session?.accessToken ?? "";
    if (token) { try { await logout(token); } catch {} }
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-20 w-full border-b border-violet-200 bg-violet-900 text-white shadow-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <SettingOutlined className="text-violet-300 text-xl" />
          <Link href="/admin" className="text-lg font-semibold tracking-tight text-white hover:text-violet-200">
            Admin Panel
          </Link>
          <span className="ml-2 rounded-full bg-violet-700 px-2 py-0.5 text-xs font-medium text-violet-200">
            {role}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {role === "SUPER_ADMIN" && (
            <Link href="/dashboard" className="text-sm text-violet-200 hover:text-white">
              Dashboard
            </Link>
          )}
          <div className="flex items-center gap-2 text-sm text-violet-200">
            <UserOutlined />
            <span>{session?.user?.name ?? session?.user?.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-violet-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
