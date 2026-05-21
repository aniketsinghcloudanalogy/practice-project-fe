"use client";

import AntSelect from '../antd/Select'
import { StyledSelectWrapper } from './styles'
import type { AppSelectProps } from './types'

const Select = ({ children, variant = 'default', ...props }: AppSelectProps) => {
	return (
		<StyledSelectWrapper $variant={variant}>
			<AntSelect {...props}>{children}</AntSelect>
		</StyledSelectWrapper>
	)
}

export default Select