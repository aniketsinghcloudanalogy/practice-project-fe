import type { ReactNode } from 'react'
import type { SiderProps } from '@/components/common/antd/layout'

export type UserRole = 'admin' | 'super_admin' | 'user'

export type SidebarItem = {
  key: string
  label: string
  icon: ReactNode
  href?: string
}

export type AppSiderProps = SiderProps & {
  variant?: 'default' | 'dark'
}
