'use client'
import { Button as AntButton } from 'antd'
import type { ButtonProps } from 'antd'

export type AppButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'danger' 
  | 'danger-light' 
  | 'auth' 
  | 'signin' 
  | 'logout' 
  | 'dropdown' 
  | 'icon-button-1' 
  | 'icon-button-2' 
  | 'soft'
  | 'ghost'
  | 'dashed'

interface AppButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: AppButtonVariant
}

export default function Button({ variant = 'primary', style, ...props }: AppButtonProps) {
  const getVariantStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      borderRadius: 8,
      fontWeight: 500,
    }

    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          background: '#1677ff',
          borderColor: '#1677ff',
          color: '#ffffff',
          height: 44,
          fontWeight: 600,
        }
      
      case 'secondary':
        return {
          ...baseStyles,
          background: '#f8fafc',
          borderColor: '#e2e8f0',
          color: '#374151',
          height: 44,
          fontWeight: 600,
        }

      case 'danger':
        return {
          ...baseStyles,
          background: '#ef4444',
          borderColor: '#ef4444',
          color: '#ffffff',
          height: 44,
          fontWeight: 600,
        }

      case 'danger-light':
        return {
          ...baseStyles,
          background: 'transparent',
          borderColor: 'rgba(255, 255, 255, 0.55)',
          color: '#ffffff',
          boxShadow: 'none',
        }

      case 'auth':
        return {
          ...baseStyles,
          background: '#ffffff',
          borderColor: '#cbd5e1',
          color: '#1e293b',
          borderRadius: 9999,
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
          height: 44,
          fontWeight: 600,
        }

      case 'signin':
        return {
          ...baseStyles,
          background: 'linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)',
          borderColor: '#2563eb',
          color: '#ffffff',
          borderRadius: 9999,
          boxShadow: '0 14px 30px rgba(37, 99, 235, 0.22)',
          height: 44,
          fontWeight: 600,
        }

      case 'logout':
        return {
          ...baseStyles,
          background: '#fff1f2',
          borderColor: '#fecaca',
          color: '#b91c1c',
          boxShadow: '0 1px 4px rgba(185, 28, 28, 0.06)',
          padding: '4px 20px',
          height: 30,
          fontWeight: 600,
        }

      case 'dropdown':
        return {
          ...baseStyles,
          background: '#ffffff',
          borderColor: '#e6e6e6',
          color: '#0f172a',
          padding: '4px 20px',
          height: 30,
          fontWeight: 600,
        }

      case 'icon-button-1':
        return {
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
        }

      case 'icon-button-2':
        return {
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
        }

      case 'soft':
        return {
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
        }

      case 'ghost':
        return {
          ...baseStyles,
          background: 'transparent',
          borderColor: '#e2e8f0',
          color: '#64748b',
        }

      case 'dashed':
        return {
          ...baseStyles,
          borderStyle: 'dashed',
          borderColor: '#c4b5fd',
          color: '#7c3aed',
          background: 'transparent',
        }

      default:
        return baseStyles
    }
  }

  const getAntdType = (): ButtonProps['type'] => {
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

  const combinedStyles = { ...getVariantStyles(), ...style }

  return (
    <AntButton
      {...props}
      type={getAntdType()}
      style={combinedStyles}
    />
  )
}

export type { AppButtonProps, ButtonProps }
