import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import DashboardHeader from '@/components/layout/DashboardHeader'
import { SidebarProvider } from '@/store/features/dashboard/sidebarContext'

type DashboardLayoutProps = {
  children: ReactNode
}

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'A simple ui for Dashboard',
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-[calc(100vh-var(--navbar-height))] bg-slate-50 text-slate-900">
        <DashboardHeader />
        <Sidebar />
        <main
          className="w-full overflow-x-hidden transition-[padding-left] duration-200 px-4 sm:px-6"
          style={{
            paddingLeft: 'max(16px, calc(var(--sidebar-width, 92px) + 16px))',
            paddingTop: 'calc(var(--navbar-height) + 24px)',
            minHeight: '100vh',
          }}
        >
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
