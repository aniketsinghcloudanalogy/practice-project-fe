import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Sidebar from '@/components/layout/Sidebar'
<<<<<<< HEAD
import DashboardHeader from '@/components/layout/DashboardHeader'
import Navbar from '@/components/layout/Navbar'

=======
import { SidebarProvider } from '@/store/features/dashboard/sidebarContext'
import NavbarGuard from '@/components/layout/NavbarGuard'
>>>>>>> b7fb3a9 (Fixed as per requirement)

type DashboardLayoutProps = {
  children: ReactNode
}

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'A simple ui for Dashboard',
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
<<<<<<< HEAD
    <div className="min-h-[calc(100vh-var(--navbar-height))] bg-slate-50 text-slate-900">
      <Navbar />
      <Sidebar />

      <main
        className="w-full overflow-x-hidden transition-[padding-left] duration-200"
        style={{
          paddingLeft: 'var(--sidebar-width, 92px)',
          paddingTop: '100px',
          minHeight: 'calc(100vh - var(--navbar-height) )',
        }}
      >
        {children}
      </main>
    </div>
=======
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
>>>>>>> b7fb3a9 (Fixed as per requirement)
  )
}