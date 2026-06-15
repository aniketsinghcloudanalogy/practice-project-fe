import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Sidebar from '@/components/layout/Sidebar'

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
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <DashboardHeader />
        <Sidebar />

        <main
          className="
            w-full
            min-w-0
            pb-8
            px-4
            sm:px-6
            transition-all
            duration-200
            md:pl-[calc(var(--sidebar-width)+16px)]
          "
          style={{
            paddingTop: "calc(var(--navbar-height) + 24px)",
            minHeight: "100vh",
          }}
        >
          <div className="w-full min-w-0">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>

  )
}