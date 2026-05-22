import type { ReactNode } from 'react'

import type { FormProps } from '@/components/common/antd/Form'

export type AppFormProps = Omit<FormProps, 'children' | 'variant'> & {
	children?: ReactNode
	variant?: 'default' | 'compact'
}