import type { ReactNode } from "react";
import AdminHeader from "@/components/layout/AdminHeader";
import Sidebar from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/store/features/dashboard/sidebarContext";

export default function AdminGroupLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-slate-100 text-slate-900">
        <AdminHeader />
        <Sidebar />
        <main
          className="w-full overflow-x-hidden transition-[padding-left] duration-200 px-4 sm:px-6 py-8"
          style={{
            paddingLeft: 'max(16px, calc(var(--sidebar-width, 92px) + 16px))',
            paddingTop: 'calc(var(--navbar-height) + 24px)',
          }}
        >
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
