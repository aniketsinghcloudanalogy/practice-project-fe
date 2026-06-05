import type { TagProps } from '@/components/common/antd/Tag'

export interface AppTagProps extends Omit<TagProps, 'variant'> {
	variant?: 'default' | 'status'
}
