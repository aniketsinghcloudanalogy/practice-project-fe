"use client";

import Link from 'next/link'
import styled from 'styled-components'

/* ── Sider wrapper — targets antd classes like other common components ── */
export const StyledSiderWrapper = styled.div<{ $variant: string }>`
  .ant-layout-sider {
    position: fixed;
    top: var(--navbar-height);
    left: 0;
    z-index: 30;
    height: calc(100vh - var(--navbar-height));
    overflow-y: auto;
    flex-shrink: 0;
    border-right: 1px solid rgba(148, 163, 184, 0.28);
    box-shadow: 12px 0 40px rgba(15, 23, 42, 0.08);
    transition: width 0.22s ease;
  }

  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  ${({ $variant }) =>
    $variant === 'default' &&
    `
    .ant-layout-sider {
      background: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.98) 0%,
          rgba(248, 250, 252, 0.95) 100%
        ),
        radial-gradient(circle at top, rgba(59, 130, 246, 0.08), transparent 45%);
    }
  `}

  ${({ $variant }) =>
    $variant === 'dark' &&
    `
    .ant-layout-sider {
      background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
      border-right-color: rgba(255, 255, 255, 0.08);
      box-shadow: 12px 0 40px rgba(0, 0, 0, 0.3);
    }
  `}

  @media (max-width: 768px) {
    .ant-layout-sider {
      display: none;
    }
  }
`

/* ── Sidebar header & brand ── */
export const SidebarHeader = styled.div<{ $collapsed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ $collapsed }) => ($collapsed ? 'center' : 'space-between')};
  gap: 12px;
  padding: 8px ${({ $collapsed }) => ($collapsed ? '0' : '18px')} 16px;
`

export const BrandBlock = styled.div<{ $collapsed: boolean }>`
  display: flex;
  min-width: 0;
  align-items: center;
  gap: ${({ $collapsed }) => ($collapsed ? '0px' : '12px')};
`

export const BrandMark = styled.div`
  display: grid;
  height: 44px;
  width: 44px;
  place-items: center;
  border-radius: 14px;
  background: linear-gradient(180deg, #93c5fd 0%, #2563eb 100%);
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #eff6ff;
  box-shadow: 0 16px 30px rgba(37, 99, 235, 0.22);
  flex-shrink: 0;
`

export const BrandCopy = styled.div`
  display: flex;
  min-width: 0;
  flex-direction: column;
`

export const BrandTitle = styled.div`
  font-size: 0.98rem;
  font-weight: 700;
  color: #0f172a;
`

export const BrandSubtitle = styled.div`
  font-size: 0.78rem;
  color: #64748b;
`

/* ── Toggle & Hamburger buttons ── */
export const ToggleButton = styled.button`
  display: inline-flex;
  height: 40px;
  width: 40px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.9);
  color: #0f172a;
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(59, 130, 246, 0.45);
    background: rgba(239, 246, 255, 0.98);
  }
`

export const HamburgerButton = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  height: 36px;
  width: 36px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  color: #0f172a;
  font-size: 1.1rem;
  transition: background 0.18s ease, border-color 0.18s ease;

  &:hover {
    background: rgba(239, 246, 255, 0.98);
    border-color: rgba(59, 130, 246, 0.4);
  }

  @media (max-width: 768px) {
    display: inline-flex;
  }
`

/* ── Nav containers ── */
export const SidebarNav = styled.nav`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  padding: 4px 14px 20px;
`

export const DrawerBrandBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 16px 20px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  margin-bottom: 4px;
`

export const DrawerSidebarNav = styled.nav`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  padding: 8px 14px 20px;
`

/* ── Shared nav item base ── */
const commonItemStyles = `
  display: flex;
  width: 100%;
  align-items: center;
  gap: 14px;
  border: 1px solid transparent;
  border-radius: 16px;
  padding: 14px 16px;
  text-align: left;
  transition:
    transform 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease;

  &:hover {
    transform: translateX(2px);
    color: #0f172a;
    background: rgba(239, 246, 255, 0.98);
    border-color: rgba(59, 130, 246, 0.28);
  }
`

const activeStyles = (active: boolean) => `
  background: ${active ? 'rgba(219, 234, 254, 0.95)' : 'rgba(255, 255, 255, 0.82)'};
  border-color: ${active ? 'rgba(59, 130, 246, 0.38)' : 'rgba(148, 163, 184, 0.16)'};
  color: ${active ? '#0f172a' : '#334155'};
  box-shadow: ${active ? '0 14px 30px rgba(37, 99, 235, 0.12)' : 'none'};
`

/* ── Desktop nav items (collapsed-aware) ── */
export const SidebarLink = styled(Link)<{ $collapsed: boolean; $active: boolean }>`
  ${commonItemStyles}
  justify-content: ${({ $collapsed }) => ($collapsed ? 'center' : 'flex-start')};
  padding-inline: ${({ $collapsed }) => ($collapsed ? '0' : '16px')};
  gap: ${({ $collapsed }) => ($collapsed ? '0' : '14px')};
  ${({ $active }) => activeStyles($active)}
`

export const SidebarButton = styled.button<{ $collapsed: boolean; $active: boolean }>`
  ${commonItemStyles}
  justify-content: ${({ $collapsed }) => ($collapsed ? 'center' : 'flex-start')};
  padding-inline: ${({ $collapsed }) => ($collapsed ? '0' : '16px')};
  gap: ${({ $collapsed }) => ($collapsed ? '0' : '14px')};
  ${({ $active }) => activeStyles($active)}
`

/* ── Drawer (mobile) nav items ── */
export const DrawerNavLink = styled(Link)<{ $active: boolean }>`
  ${commonItemStyles}
  ${({ $active }) => activeStyles($active)}
`

export const DrawerNavButton = styled.button<{ $active: boolean }>`
  ${commonItemStyles}
  ${({ $active }) => activeStyles($active)}
`

/* ── Icon & label ── */
export const ItemIcon = styled.span`
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
  color: inherit;
`

export const ItemLabel = styled.span`
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: inherit;
`
