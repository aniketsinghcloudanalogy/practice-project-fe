import type { ReactNode } from 'react'
import Sidebar from '@/components/shared/Sidebar'
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
      <main
        className="w-full overflow-x-hidden transition-[padding-left] duration-200"
        style={{ paddingLeft: 'var(--sidebar-width)' }}
      >
        {children}
      </main>
    </div>
  )
}