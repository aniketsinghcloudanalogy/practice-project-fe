"use client";

import styled from 'styled-components'

export const StyledSwitchWrapper = styled.span<{ $variant: string }>`
	display: inline-flex;
	align-items: center;

	${({ $variant }) =>
		$variant === 'compact' &&
		`
		.ant-switch {
			min-width: 36px;
			height: 18px;
			line-height: 18px;
		}
	`}
`
