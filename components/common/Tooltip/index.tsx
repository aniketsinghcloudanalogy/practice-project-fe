"use client";

import AntTooltip from '../antd/Tooltip'
import type { AppTooltipProps } from './types'

const Tooltip = ({ variant = 'default', ...props }: AppTooltipProps) => {
	void variant

	return <AntTooltip {...props} />
}

export default Tooltip
