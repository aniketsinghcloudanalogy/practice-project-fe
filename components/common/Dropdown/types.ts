import type { DropdownProps, MenuProps } from '@/components/common/antd/Dropdown'

export type AppDropdownProps = {
  menuItems: MenuProps['items']
  trigger?: ('hover' | 'click' | 'contextMenu')[]
  placement?: DropdownProps['placement']
  children: React.ReactNode
}
