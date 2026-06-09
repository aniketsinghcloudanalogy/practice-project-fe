import type { SelectProps } from '@/components/common/antd/Select'

export interface AppSelectProps extends Omit<SelectProps, 'variant'> {
	variant?: 'default' | 'soft' | 'panel'
}