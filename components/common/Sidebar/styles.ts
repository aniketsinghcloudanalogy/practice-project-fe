"use client";

import Link from 'next/link'
import styled from 'styled-components'
import Layout from '@/components/common/antd/layout'
import type { SidebarProps } from './types'

export const SidebarShell = styled(Layout.Sider)<SidebarProps>`
	display: flex;
	position: fixed;
	top: var(--navbar-height);
	left: 0;
	z-index: 30;
	height: calc(100vh - var(--navbar-height));
	overflow-y: auto;
	width: ${({ $collapsed }) => ($collapsed ? '92px' : '288px')};
	flex-shrink: 0;
	flex-direction: column;
	border-right: 1px solid rgba(148, 163, 184, 0.28);
	background:
		linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%),
		radial-gradient(circle at top, rgba(59, 130, 246, 0.08), transparent 45%);
	box-shadow: 12px 0 40px rgba(15, 23, 42, 0.08);
	transition: width 0.22s ease;
`

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

export const ToggleButton = styled.button<{ $collapsed: boolean }>`
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
	transition:
		transform 0.2s ease,
		background 0.2s ease,
		border-color 0.2s ease;

	& > svg {
		transition: transform 0.18s ease, opacity 0.12s ease;
		transform: rotate(0deg);
	}

	&:hover {
		transform: translateY(-1px);
		border-color: rgba(59, 130, 246, 0.45);
		background: rgba(239, 246, 255, 0.98);
	}

	@media (max-width: 768px) {
		margin-inline: auto;
	}
`

export const SidebarNav = styled.nav`
	display: flex;
	flex: 1;
	flex-direction: column;
	gap: 10px;
	padding: 4px 14px 20px;
`

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
	}
`

export const SidebarLink = styled(Link)<{ $collapsed: boolean; $active: boolean }>`
	${commonItemStyles}
	justify-content: ${({ $collapsed }) => ($collapsed ? 'center' : 'flex-start')};
	padding-inline: ${({ $collapsed }) => ($collapsed ? '0' : '16px')};
	gap: ${({ $collapsed }) => ($collapsed ? '0' : '14px')};
	text-align: ${({ $collapsed }) => ($collapsed ? 'center' : 'left')};
	background: ${({ $active }) => ($active ? 'rgba(219, 234, 254, 0.95)' : 'rgba(255, 255, 255, 0.82)')};
	border-color: ${({ $active }) => ($active ? 'rgba(59, 130, 246, 0.38)' : 'rgba(148, 163, 184, 0.16)')};
	color: ${({ $active }) => ($active ? '#0f172a' : '#334155')};
	box-shadow: ${({ $active }) => ($active ? '0 14px 30px rgba(37, 99, 235, 0.12)' : 'none')};

	&:hover {
		color: #0f172a;
		background: rgba(239, 246, 255, 0.98);
		border-color: rgba(59, 130, 246, 0.28);
	}
`

export const SidebarButton = styled.button<{ $collapsed: boolean; $active: boolean }>`
	${commonItemStyles}
	justify-content: ${({ $collapsed }) => ($collapsed ? 'center' : 'flex-start')};
	padding-inline: ${({ $collapsed }) => ($collapsed ? '0' : '16px')};
	gap: ${({ $collapsed }) => ($collapsed ? '0' : '14px')};
	text-align: ${({ $collapsed }) => ($collapsed ? 'center' : 'left')};
	background: ${({ $active }) => ($active ? 'rgba(219, 234, 254, 0.95)' : 'rgba(255, 255, 255, 0.82)')};
	border-color: ${({ $active }) => ($active ? 'rgba(59, 130, 246, 0.38)' : 'rgba(148, 163, 184, 0.16)')};
	color: ${({ $active }) => ($active ? '#0f172a' : '#334155')};
	box-shadow: ${({ $active }) => ($active ? '0 14px 30px rgba(37, 99, 235, 0.12)' : 'none')};

	&:hover {
		color: #0f172a;
		background: rgba(239, 246, 255, 0.98);
		border-color: rgba(59, 130, 246, 0.28);
	}
`

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
