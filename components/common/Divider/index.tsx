"use client";

import AntDivider from '../antd/Divider'
import { StyledDividerWrapper } from './styles'
import type { AppDividerProps } from './types'

const Divider = ({ children, ...props }: AppDividerProps) => {
	return (
		<StyledDividerWrapper>
			<AntDivider {...props}>{children}</AntDivider>
		</StyledDividerWrapper>
	)
}

export default Divider