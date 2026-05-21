"use client";

import styled from 'styled-components'

export const StyledModalWrapper = styled.div<{ $variant: string }>`
	.ant-modal-content {
		border-radius: 16px;
	}

	${({ $variant }) =>
		$variant === 'compact' &&
		`
		.ant-modal-content {
			padding: 16px;
		}
	`}
`