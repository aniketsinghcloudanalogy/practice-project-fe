import type { ReactNode } from 'react'
import Sidebar from '@/components/core/Sidebar'
import DashboardHeader from '@/components/core/DashboardHeader'
import { Metadata } from 'next';

type DashboardLayoutProps = {
  children: ReactNode
}

export const metadata: Metadata = {
  title: "Dashboard",
  description: "A simple ui for Dashboard",
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />
      <div
        className="flex min-h-screen flex-col transition-[padding-left] duration-200"
        style={{ paddingLeft: 'var(--sidebar-width)' }}
      >
        <DashboardHeader />
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
