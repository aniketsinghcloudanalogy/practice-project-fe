"use client";

import AntButton from '../antd/Button'
import { StyledButtonWrapper } from './styles'
import type { AppButtonProps } from './types'

const Button = ({ children, variant = 'primary', ...props }: AppButtonProps) => {
	return (
		<StyledButtonWrapper $variant={variant}>
			<AntButton {...props}>{children}</AntButton>
		</StyledButtonWrapper>
	)
}

export default Button