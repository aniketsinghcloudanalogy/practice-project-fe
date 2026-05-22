import type { InputProps } from '@/components/common/antd/Input'

export type AppInputProps = Omit<InputProps, 'variant'> & {
	appearance?: 'default' | 'soft'
}