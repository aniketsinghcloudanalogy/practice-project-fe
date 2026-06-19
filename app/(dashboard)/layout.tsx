import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import { SidebarProvider } from '@/store/features/dashboard/sidebarContext'
import NavbarGuard from '@/components/layout/NavbarGuard'

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
        <NavbarGuard  >
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
        </NavbarGuard>
      </div>
    </SidebarProvider>
  )
}