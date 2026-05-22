"use client";

import styled from 'styled-components'

export const StyledCheckboxWrapper = styled.div<{ $variant: string }>`
	.ant-checkbox-inner {
		border-radius: 4px;
	}

	${({ $variant }) =>
		$variant === 'soft' &&
		`
		.ant-checkbox-inner {
			background: #f8fafc;
		}
	`}
`