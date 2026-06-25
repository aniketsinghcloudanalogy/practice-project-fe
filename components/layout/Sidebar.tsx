"use client";

import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useSidebar } from '@/store/features/dashboard/sidebarContext'
import { FaHandshake, FaRobot } from "react-icons/fa";
import {
  MdHome,
  MdDescription,
  MdGroup,
  MdPerson,
  MdTrendingUp,
  MdShoppingCart,
  MdDashboard,
  MdPeople,
  MdSettings,
  MdSecurity,
  MdManageAccounts,
  MdSupervisorAccount,
} from 'react-icons/md'
import { HiAdjustmentsHorizontal } from "react-icons/hi2";
import { MdArrowBack, MdArrowForward, MdClose } from 'react-icons/md'
import Drawer from '@/components/common/Drawer'
import SiderComponent from '@/components/common/Sidebar'
import {
  FilePdfOutlined,
} from "@/components/common/antd/icons"
import {
  BrandBlock,
  BrandCopy,
  BrandMark,
  BrandSubtitle,
  BrandTitle,
  DrawerBrandBlock,
  DrawerNavButton,
  DrawerNavLink,
  DrawerSidebarNav,
  ItemIcon,
  ItemLabel,
  SidebarButton,
  SidebarHeader,
  SidebarLink,
  SidebarNav,
  ToggleButton,
} from '@/components/common/Sidebar/styles'
import type { SidebarItem, UserRole } from '@/components/common/Sidebar/types'
import Tooltip from '@/components/common/Tooltip'

const itemsByRole: Record<UserRole, SidebarItem[]> = {
  user: [
    { key: 'home', label: 'Home', icon: <MdHome size={20} />, href: '/dashboard' },
    { key: 'quote', label: 'Quote', icon: <MdDescription size={20} /> },
    { key: 'pdf', label: 'PDF Extraction', icon: <FilePdfOutlined />, href: '/pdf' },
    { key: 'accounts', label: 'Accounts', icon: <MdGroup size={20} /> },
    { key: 'customers', label: 'Customers', icon: <MdPeople size={20} />, href: '/customer' },
    { key: 'contacts', label: 'Contacts', icon: <MdPerson size={20} />, href: '/contact' },
    { key: 'opportunity', label: 'Opportunity', icon: <MdTrendingUp size={20} /> },
    { key: 'order', label: 'Order', icon: <MdShoppingCart size={20} /> },
  ],
  admin: [
    { key: 'dashboard',  label: 'Dashboard',   icon: <MdDashboard size={20} />,        href: '/admin' },
    { key: 'users',      label: 'Users',        icon: <MdPeople size={20} /> },
    { key: 'contacts',   label: 'Contacts',     icon: <MdPerson size={20} />,           href: '/contact' },
    { key: 'partners',   label: 'Partners',     icon: <FaHandshake size={20} />,          href: '/adminPartner' },
    { key: 'dealregai',  label: 'DealRegAi',   icon: <HiAdjustmentsHorizontal size={20} />,            href: '/dealRegAi' },
    { key: 'manage',     label: 'Manage',       icon: <MdManageAccounts size={20} /> },
    { key: 'settings',   label: 'Settings',     icon: <MdSettings size={20} /> },
  ],
  super_admin: [
    { key: 'dashboard',   label: 'Dashboard',    icon: <MdDashboard size={20} />,          href: '/admin' },
    { key: 'users',       label: 'Users',         icon: <MdSupervisorAccount size={20} /> },
    { key: 'contacts',    label: 'Contacts',      icon: <MdPerson size={20} />,             href: '/contact' },
    { key: 'partners',   label: 'Partners',     icon: <FaHandshake size={20} />,          href: '/superAdminPartner' },
    { key: 'security',    label: 'Security',      icon: <MdSecurity size={20} /> },
    { key: 'settings',    label: 'Settings',      icon: <MdSettings size={20} /> },
  ],
}

const Sidebar = () => {
  const pathname = usePathname() ?? ''
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(true)
  const { mobileOpen, closeMobile } = useSidebar()

  const rawRole = session?.user?.role?.toLowerCase() as UserRole
  const role: UserRole = itemsByRole[rawRole] ? rawRole : 'user'
  const sidebarItems = itemsByRole[role]

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width',
      collapsed ? '92px' : '288px',
    )
  }, [collapsed])

  const activeKey = useMemo(() => {
    const match = sidebarItems.find(
      (item) => item.href && (pathname === item.href || pathname.startsWith(`${item.href}/`)),
    )
    return match?.key ?? sidebarItems[0]?.key
  }, [pathname, sidebarItems])

  const drawerNav = sidebarItems.map((item) => {
    const isActive = activeKey === item.key
    if (item.href) {
      return (
        <DrawerNavLink key={item.key} href={item.href} $active={isActive} onClick={closeMobile}>
          <ItemIcon>{item.icon}</ItemIcon>
          <ItemLabel>{item.label}</ItemLabel>
        </DrawerNavLink>
      )
    }
    return (
      <DrawerNavButton key={item.key} type="button" $active={isActive}>
        <ItemIcon>{item.icon}</ItemIcon>
        <ItemLabel>{item.label}</ItemLabel>
      </DrawerNavButton>
    )
  })

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="sidebar"
        open={mobileOpen}
        onClose={closeMobile}
        placement="left"
        size="default"
        closable={false}
      >
        <DrawerBrandBlock>
          <BrandMark>PM</BrandMark>
          <BrandCopy>
            <BrandTitle>Project May</BrandTitle>
            <BrandSubtitle>Welcome</BrandSubtitle>
          </BrandCopy>
          <button
            type="button"
            onClick={closeMobile}
            aria-label="Close navigation"
            style={{
              marginLeft: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 32,
              width: 32,
              borderRadius: 8,
              border: '1px solid rgba(148,163,184,0.3)',
              background: 'rgba(255,255,255,0.8)',
              color: '#64748b',
              flexShrink: 0,
            }}
          >
            <MdClose size={18} />
          </button>
        </DrawerBrandBlock>
        <DrawerSidebarNav>{drawerNav}</DrawerSidebarNav>
      </Drawer>

      {/* Desktop Sidebar */}
      <SiderComponent
        variant="default"
        collapsed={collapsed}
        collapsible
        collapsedWidth={92}
        width={288}
        trigger={null}
      >
        <SidebarHeader $collapsed={collapsed}>
          <BrandBlock $collapsed={collapsed}>
            {!collapsed && <BrandMark>PM</BrandMark>}
            {!collapsed && (
              <BrandCopy>
                <BrandTitle>Project May</BrandTitle>
                <BrandSubtitle>Welcome</BrandSubtitle>
              </BrandCopy>
            )}
          </BrandBlock>
          <ToggleButton
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <MdArrowForward size={18} /> : <MdArrowBack size={18} />}
          </ToggleButton>
        </SidebarHeader>

        <SidebarNav>
          {sidebarItems.map((item) => {
            const isActive = activeKey === item.key
            const iconNode = (
              <Tooltip title={collapsed ? item.label : ''} placement="right">
                <ItemIcon>{item.icon}</ItemIcon>
              </Tooltip>
            )
            if (item.href) {
              return (
                <SidebarLink key={item.key} href={item.href} $collapsed={collapsed} $active={isActive}>
                  {iconNode}
                  {!collapsed && <ItemLabel>{item.label}</ItemLabel>}
                </SidebarLink>
              )
            }
            return (
              <SidebarButton key={item.key} type="button" $collapsed={collapsed} $active={isActive}>
                {iconNode}
                {!collapsed && <ItemLabel>{item.label}</ItemLabel>}
              </SidebarButton>
            )
          })}
        </SidebarNav>
      </SiderComponent>
    </>
  )
}

export default Sidebar
