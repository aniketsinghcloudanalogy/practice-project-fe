import type { ReactNode } from "react";
import AdminHeader from "@/components/layout/AdminHeader";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "Admin user management",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AdminHeader />
      <main className="mx-auto w-full max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
