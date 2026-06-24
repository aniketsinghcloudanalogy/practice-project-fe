'use client'
import AntButton from '../antd/Button'
import type { AppButtonProps } from './types'
import { getVariantStyles, getAntdType } from './styles'

export default function Button({ variant = 'primary', style, ...props }: AppButtonProps) {
  return (
    <AntButton
      {...props}
      type={getAntdType(variant)}
      style={{ ...getVariantStyles(variant), ...style }}
    />
  )
}

export type { AppButtonProps, AppButtonVariant, ButtonProps } from './types'
