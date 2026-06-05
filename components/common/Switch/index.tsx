"use client";

import AntSwitch from '../antd/Switch'
import { StyledSwitchWrapper } from './styles'
import type { AppSwitchProps } from './types'

const Switch = ({ variant = 'default', ...props }: AppSwitchProps) => {
	return (
		<StyledSwitchWrapper $variant={variant}>
			<AntSwitch {...props} />
		</StyledSwitchWrapper>
	)
}

export default Switch
