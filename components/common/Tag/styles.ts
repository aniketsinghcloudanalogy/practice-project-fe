"use client";

import styled from 'styled-components'

export const StyledTagWrapper = styled.span<{ $variant: string }>`
	display: inline-flex;
	align-items: center;

	${({ $variant }) =>
		$variant === 'status' &&
		`
		.ant-tag {
			border-radius: 9999px;
			font-weight: 500;
			font-size: 12px;
			padding: 0 10px;
		}
	`}
`
