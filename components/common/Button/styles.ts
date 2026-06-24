import type { CSSProperties } from 'react'
import type { AppButtonVariant } from './types'
import type { ButtonProps } from 'antd'

const baseStyles: CSSProperties = {
  borderRadius: 8,
  fontWeight: 500,
}

const variantStyles: Record<AppButtonVariant, CSSProperties> = {
  primary: {
    ...baseStyles,
    background: '#1677ff',
    borderColor: '#1677ff',
    color: '#ffffff',
    height: 44,
    fontWeight: 600,
  },
  secondary: {
    ...baseStyles,
    background: '#f8fafc',
    borderColor: '#e2e8f0',
    color: '#374151',
    height: 44,
    fontWeight: 600,
  },
  danger: {
    ...baseStyles,
    background: '#ef4444',
    borderColor: '#ef4444',
    color: '#ffffff',
    height: 44,
    fontWeight: 600,
  },
  'danger-light': {
    ...baseStyles,
    background: 'transparent',
    borderColor: 'rgba(255, 255, 255, 0.55)',
    color: '#ffffff',
    boxShadow: 'none',
  },
  auth: {
    ...baseStyles,
    background: '#ffffff',
    borderColor: '#cbd5e1',
    color: '#1e293b',
    borderRadius: 9999,
    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
    height: 44,
    fontWeight: 600,
  },
  signin: {
    ...baseStyles,
    background: 'linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)',
    borderColor: '#2563eb',
    color: '#ffffff',
    borderRadius: 9999,
    boxShadow: '0 14px 30px rgba(37, 99, 235, 0.22)',
    height: 44,
    fontWeight: 600,
  },
  logout: {
    ...baseStyles,
    background: '#fff1f2',
    borderColor: '#fecaca',
    color: '#b91c1c',
    boxShadow: '0 1px 4px rgba(185, 28, 28, 0.06)',
    padding: '4px 20px',
    height: 30,
    fontWeight: 600,
  },
  dropdown: {
    ...baseStyles,
    background: '#ffffff',
    borderColor: '#e6e6e6',
    color: '#0f172a',
    padding: '4px 20px',
    height: 30,
    fontWeight: 600,
  },
  'icon-button-1': {
    ...baseStyles,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 28,
    minWidth: 40,
    padding: 0,
    borderRadius: 10,
    background: '#eff6ff',
    color: '#2563eb',
    borderColor: '#bfdbfe',
    boxShadow: 'none',
  },
  'icon-button-2': {
    ...baseStyles,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 46,
    height: 46,
    minWidth: 46,
    padding: 0,
    borderRadius: 10,
    background: 'transparent',
    color: '#ef4444',
    border: 'none',
    boxShadow: 'none',
    fontSize: 20,
  },
  soft: {
    ...baseStyles,
    width: 38,
    height: 38,
    padding: 0,
    borderRadius: 12,
    background: '#ffffff',
    borderColor: '#d8e1ed',
    color: '#243b63',
    boxShadow: '0 8px 18px rgba(15, 23, 42, 0.05)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghost: {
    ...baseStyles,
    background: 'transparent',
    borderColor: '#e2e8f0',
    color: '#64748b',
  },
  dashed: {
    ...baseStyles,
    borderStyle: 'dashed',
    borderColor: '#c4b5fd',
    color: '#7c3aed',
    background: 'transparent',
  },
}

export function getVariantStyles(variant: AppButtonVariant): CSSProperties {
  return variantStyles[variant] ?? baseStyles
}

export function getAntdType(variant: AppButtonVariant): ButtonProps['type'] {
  switch (variant) {
    case 'primary':
    case 'signin':
      return 'primary'
    case 'ghost':
      return 'text'
    case 'dashed':
      return 'dashed'
    default:
      return 'default'
  }
}
