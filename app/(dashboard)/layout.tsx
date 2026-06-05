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
    <div className="min-h-[calc(100vh-var(--navbar-height))] bg-slate-50 text-slate-900">
      <Sidebar />
      <main
        className="w-full overflow-x-hidden transition-[padding-left] duration-200"
        style={{
          paddingLeft: 'var(--sidebar-width, 92px)',
          paddingTop: '24px',
          minHeight: 'calc(100vh - var(--navbar-height))',
        }}
      >
        {children}
      </main>
    </div>
  )
}
