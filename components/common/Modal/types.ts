import type { ModalProps } from '@/components/common/antd/Modal'

export interface AppModalProps extends ModalProps {
	variant?: 'default' | 'compact'
}