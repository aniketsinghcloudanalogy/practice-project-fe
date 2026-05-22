"use client";

import styled from 'styled-components'

export const StyledTypographyWrapper = styled.div<{ $variant: string }>`
	color: #111827;

	${({ $variant }) =>
		$variant === 'muted' &&
		`
		color: #6b7280;
	`}
`