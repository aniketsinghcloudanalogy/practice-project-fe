"use client";

import { createElement } from 'react'
import AntCollapse from '../antd/Collapse'
import { StyledCollapseWrapper } from './style'
import type { AppCollapseProps } from './types'

const Collapse = ({ variant = 'default', ...props }: AppCollapseProps) => {
	return createElement(
		StyledCollapseWrapper,
		{ $variant: variant },
		createElement(AntCollapse, props),
	)
}

export default Collapse
