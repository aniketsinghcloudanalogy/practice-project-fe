"use client";

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'
import {
  CloseOutlined,
  FileTextOutlined,
  HomeOutlined,
  MenuOutlined,
  RiseOutlined,
  ShoppingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'

import {
  BrandBlock,
  BrandCopy,
  BrandMark,
  BrandSubtitle,
  BrandTitle,
  ItemIcon,
  ItemLabel,
  SidebarButton,
  SidebarHeader,
  SidebarLink,
  SidebarNav,
  SidebarShell,
  ToggleButton,
} from '@/components/common/Sidebar/styles'
import type { SidebarItem } from '@/components/common/Sidebar/types'

const sidebarItems: SidebarItem[] = [
  { key: 'home', label: 'Home', icon: <HomeOutlined />, href: '/dashboard' },
  { key: 'quote', label: 'Quote', icon: <FileTextOutlined /> },
  { key: 'accounts', label: 'Accounts', icon: <TeamOutlined /> },
  { key: 'contacts', label: 'Contacts', icon: <UserOutlined /> },
  { key: 'opportunity', label: 'Opportunity', icon: <RiseOutlined /> },
  { key: 'order', label: 'Order', icon: <ShoppingOutlined /> },
]

const Sidebar = () => {
  const pathname = usePathname() ?? ''
  const [collapsed, setCollapsed] = useState(true)

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width',
      collapsed ? '92px' : '288px',
    )
    document.documentElement.style.setProperty(
      '--navbar-offset',
      collapsed ? '92px' : '0px',
    )
  }, [collapsed])

  const activeKey = useMemo(() => {
    if (pathname.startsWith('/dashboard')) {
      return 'home'
    }

    return 'home'
  }, [pathname])

  return (
    <SidebarShell $collapsed={collapsed}>
      <SidebarHeader $collapsed={collapsed}>
        <BrandBlock $collapsed={collapsed}>
          {!collapsed && <BrandMark>PP</BrandMark>}
          {!collapsed && (
            <BrandCopy>
              <BrandTitle>Sidebar</BrandTitle>
              <BrandSubtitle>Navigation</BrandSubtitle>
            </BrandCopy>
          )}
        </BrandBlock>

        <ToggleButton
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <MenuOutlined /> : <CloseOutlined />}
        </ToggleButton>
      </SidebarHeader>

      <SidebarNav>
        {sidebarItems.map((item) => {
          const isActive = activeKey === item.key

          if (item.href) {
            return (
              <SidebarLink
                key={item.key}
                href={item.href}
                $collapsed={collapsed}
                $active={isActive}
              >
                <ItemIcon>{item.icon}</ItemIcon>
                {!collapsed && <ItemLabel>{item.label}</ItemLabel>}
              </SidebarLink>
            )
          }

          return (
            <SidebarButton
              key={item.key}
              type="button"
              $collapsed={collapsed}
              $active={isActive}
            >
              <ItemIcon>{item.icon}</ItemIcon>
              {!collapsed && <ItemLabel>{item.label}</ItemLabel>}
            </SidebarButton>
          )
        })}
      </SidebarNav>
    </SidebarShell>
  )
}

export default Sidebar
