import type { FormProps } from '@/components/common/antd/Form'

export interface AppFormProps extends FormProps {
	variant?: 'default' | 'compact'
}