"use client";

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  HomeOutlined,
  ArrowRightOutlined,
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
  { key: 'contacts', label: 'Contacts', icon: <UserOutlined /> , href: '/contact'},
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
  }, [collapsed])

  const activeKey = useMemo(() => {
    const activeItem = sidebarItems.find((item) => {
      if (!item.href) return false
      return pathname === item.href || pathname.startsWith(`${item.href}/`)
    })

    if (activeItem) {
      return activeItem.key
    }

    if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
      return 'home'
    }

    return 'home'
  }, [pathname])

  return (
    <SidebarShell
      $collapsed={collapsed}
      collapsed={collapsed}
      collapsible
      collapsedWidth={92}
      width={288}
      trigger={null}
    >
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
          $collapsed={collapsed}
        >
          {collapsed ? <ArrowRightOutlined /> : <ArrowLeftOutlined />}
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
