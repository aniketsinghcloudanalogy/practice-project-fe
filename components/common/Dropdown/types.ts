import type { MenuProps } from 'antd'

export type AppDropdownProps = {
  menuItems: MenuProps['items']
  trigger?: ('hover' | 'click' | 'contextMenu')[]
  placement?: any
  children: React.ReactNode
}
