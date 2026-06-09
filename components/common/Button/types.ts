import type { ButtonProps } from '@/components/common/antd/Button'

export type AppButtonProps = Omit<ButtonProps, 'variant'> & {
	variant?: 'primary' | 'secondary' | 'danger' | 'auth' | 'signin' | 'logout' | 'dropdown' | 'soft'
}

