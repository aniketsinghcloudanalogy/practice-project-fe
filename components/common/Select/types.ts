import type { SelectProps } from '@/components/common/antd/Select'

<<<<<<< HEAD
export interface AppSelectProps extends Omit<SelectProps, 'variant'> {
=======
export interface AppSelectProps extends SelectProps {
>>>>>>> origin/main
	variant?: 'default' | 'soft'
}