"use client";

import AntTag from '../antd/Tag'
import { StyledTagWrapper } from './styles'
import type { AppTagProps } from './types'

const Tag = ({ variant = 'default', ...props }: AppTagProps) => {
	return (
		<StyledTagWrapper $variant={variant}>
			<AntTag {...props} />
		</StyledTagWrapper>
	)
}

export default Tag
