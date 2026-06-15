import type { ButtonProps } from '@/components/common/antd/Button'

export type AppButtonProps = Omit<ButtonProps, 'variant'> & {
	variant?: 'primary' | 'secondary' | 'danger' | 'danger-light' | 'auth' | 'signin' | 'logout' | 'dropdown' | 'icon-button-1' | 'icon-button-2'
}
