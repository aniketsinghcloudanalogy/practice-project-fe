'use client'
import { Button as AntButton } from 'antd'
import type { ButtonProps } from 'antd'

export type CustomButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dashed'

interface Props extends Omit<ButtonProps, 'variant'> {
  variant?: CustomButtonVariant
}

export default function Button({ variant, style, ...props }: Props) {
  const variantStyles: Record<CustomButtonVariant, React.CSSProperties> = {
    primary: { background: '#7c3aed', borderColor: '#7c3aed', color: '#fff' },
    secondary: { background: '#f5f3ff', borderColor: '#e9d5ff', color: '#7c3aed' },
    ghost: { background: 'transparent', borderColor: '#e2e8f0', color: '#64748b' },
    danger: { background: '#fff1f2', borderColor: '#fecdd3', color: '#ef4444' },
    dashed: { borderStyle: 'dashed', borderColor: '#c4b5fd', color: '#7c3aed', background: 'transparent' },
  }

  const variantType: Record<CustomButtonVariant, ButtonProps['type']> = {
    primary: 'primary',
    secondary: 'default',
    ghost: 'text',
    danger: 'default',
    dashed: 'dashed',
  }

  const applied = variant ? variantStyles[variant] : {}
  const type = variant ? variantType[variant] : props.type

  return (
    <AntButton
      {...props}
      type={type}
      style={{ borderRadius: 8, fontWeight: 500, ...applied, ...style }}
    />
  )
}

export type { ButtonProps }
