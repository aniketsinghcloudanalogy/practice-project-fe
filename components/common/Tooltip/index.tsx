"use client";

import AntTooltip from '../antd/Tooltip'
import type { AppTooltipProps } from './types'

const Tooltip = ({ variant = 'default', ...props }: AppTooltipProps) => {
	return <AntTooltip {...props} />
}

export default Tooltip
