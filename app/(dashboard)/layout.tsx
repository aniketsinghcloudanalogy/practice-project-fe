import type { ReactNode } from 'react'
<<<<<<< HEAD:app/(dashboard)/layout.tsx
import Sidebar from '@/components/layout/Sidebar'
=======
import Sidebar from '@/components/core/Sidebar'
import DashboardHeader from '@/components/core/DashboardHeader'
>>>>>>> d4d97c8cfe0e76373c61bdb4bf704957e1595650:app/(dashboard)/dashboard/layout.tsx
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
<<<<<<< HEAD:app/(dashboard)/layout.tsx
      <main
        className="w-full overflow-x-hidden overflow-y-auto transition-[padding-left] duration-200"
        style={{ paddingLeft: 'var(--sidebar-width, 92px)', paddingTop: '8px', height: '100vh' }}
=======
      <div
        className="flex min-h-screen flex-col transition-[padding-left] duration-200"
        style={{ paddingLeft: 'var(--sidebar-width)' }}
>>>>>>> d4d97c8cfe0e76373c61bdb4bf704957e1595650:app/(dashboard)/dashboard/layout.tsx
      >
        <DashboardHeader />
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
