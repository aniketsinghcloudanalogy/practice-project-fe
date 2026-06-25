import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import { SidebarProvider } from '@/store/features/dashboard/sidebarContext'
import DashboardHeader from '@/components/layout/DashboardHeader'

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
        <div className="shrink-0 pt-(--navbar-height)" aria-hidden="true" />
        <Sidebar />
        <main
          className="w-full overflow-x-hidden transition-[padding-left] duration-200"
          style={{
            paddingLeft: 'var(--sidebar-width, 92px)',
            paddingTop: '0px',
            minHeight: 'calc(100vh - var(--navbar-height))',
          }}
        >
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}