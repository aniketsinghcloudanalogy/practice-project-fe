"use client";

import { createElement } from 'react'
import AntTabs from '../antd/Tabs'
import { StyledTabsWrapper } from './style'
import type { AppTabsProps } from './types'

const Tabs = ({ variant = 'default', ...props }: AppTabsProps) => {
	return createElement(
		StyledTabsWrapper,
		{ $variant: variant },
		createElement(AntTabs, props),
	)
}

export default Tabs
