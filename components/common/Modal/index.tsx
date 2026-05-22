"use client";

import AntModal from '../antd/Modal'
import { StyledModalWrapper } from './styles'
import type { AppModalProps } from './types'

const Modal = ({ children, variant = 'default', ...props }: AppModalProps) => {
	return (
		<StyledModalWrapper $variant={variant}>
			<AntModal {...props}>{children}</AntModal>
		</StyledModalWrapper>
	)
}

export default Modal