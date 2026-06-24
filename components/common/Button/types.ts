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

export interface AppButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: AppButtonVariant
}

export type { ButtonProps }
