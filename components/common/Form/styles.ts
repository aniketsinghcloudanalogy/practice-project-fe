"use client";

import styled from 'styled-components'

export const StyledFormWrapper = styled.div<{ $variant: string }>`
	.ant-form-item {
		margin-bottom: 16px;
	}

	${({ $variant }) =>
		$variant === 'compact' &&
		`
		.ant-form-item {
			margin-bottom: 12px;
		}
	`}
`