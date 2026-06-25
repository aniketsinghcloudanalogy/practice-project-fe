import type { CollapseProps } from '@/components/common/antd/Collapse'

export interface AppCollapseProps extends Omit<CollapseProps, 'variant'> {
	variant?: 'default' | 'soft' | 'panel'
}
