"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

const navItems = ["Overview", "Analytics", "Projects", "Settings"];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const user = session?.user;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-60 bg-white shadow-md flex flex-col justify-between py-6 px-4">
        <div>
          <div className="text-xl font-bold text-blue-600 mb-8 px-2">MyApp</div>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item}
                className="text-left px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                {item}
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar user info */}
        <div className="flex items-center gap-3 px-2 pt-4 border-t border-gray-100">
          {user?.image ? (
            <Image src={user.image} alt="avatar" width={36} height={36} className="rounded-full object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
              {user?.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
          )}
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-gray-800 truncate">{user?.name ?? "User"}</span>
            <span className="text-xs text-gray-400 truncate">{user?.email ?? ""}</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">Overview</h1>

          <div className="flex items-center gap-3">
            {user?.image ? (
              <Image src={user.image} alt="avatar" width={38} height={38} className="rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                {user?.name?.charAt(0).toUpperCase() ?? "U"}
              </div>
            )}
            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-medium text-gray-800">{user?.name ?? "User"}</span>
              <span className="text-xs text-gray-400">{user?.email ?? ""}</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="ml-2 px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="p-6 flex flex-col gap-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Projects", value: "12" },
              { label: "Active Tasks", value: "5" },
              { label: "Team Members", value: "8" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl shadow-sm p-5">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Profile card */}
          <div className="bg-white rounded-xl shadow-sm p-6 max-w-sm">
            <p className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wide">Logged in as</p>
            <div className="flex items-center gap-4">
              {user?.image ? (
                <Image src={user.image} alt="avatar" width={56} height={56} className="rounded-full object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name?.charAt(0).toUpperCase() ?? "U"}
                </div>
              )}
              <div>
                <p className="text-base font-semibold text-gray-800">{user?.name ?? "—"}</p>
                <p className="text-sm text-gray-400">{user?.email ?? "—"}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
