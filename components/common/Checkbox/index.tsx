"use client";

import AntCheckbox from '../antd/Checkbox'
import { StyledCheckboxWrapper } from './styles'
import type { AppCheckboxProps } from './types'

const Checkbox = ({ children, variant = 'default', ...props }: AppCheckboxProps) => {
	return (
		<StyledCheckboxWrapper $variant={variant}>
			<AntCheckbox {...props}>{children}</AntCheckbox>
		</StyledCheckboxWrapper>
	)
}

export default Checkbox