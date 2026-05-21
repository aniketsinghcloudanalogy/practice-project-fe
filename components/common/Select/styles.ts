"use client";

import styled from 'styled-components'

export const StyledSelectWrapper = styled.div<{ $variant: string }>`
	.ant-select-selector {
		min-height: 44px !important;
		border-radius: 8px !important;
	}

	${({ $variant }) =>
		$variant === 'soft' &&
		`
		.ant-select-selector {
			background: #f8fafc !important;
			border-color: #e2e8f0 !important;
		}
	`}
`