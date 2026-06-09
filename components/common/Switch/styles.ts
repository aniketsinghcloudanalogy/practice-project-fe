"use client";

import styled from 'styled-components'

export const StyledSwitchWrapper = styled.span<{ $variant: string }>`
	display: inline-flex;
	align-items: center;
	justify-content: center;

	${({ $variant }) =>
		$variant === 'compact' &&
		`
		.ant-switch {
			min-width: 38px;
			height: 20px;
			line-height: 20px;
			background: #cbd5e1;
			box-shadow: inset 0 0 0 1px rgba(36, 59, 99, 0.06);
			transition: all 0.2s ease;
		}

		.ant-switch.ant-switch-checked {
			background: #243b63;
		}

		.ant-switch-handle {
			inset-inline-start: 2px;
			top: 2px;
			transition: all 0.2s ease;
		}

		.ant-switch-checked .ant-switch-handle {
			inset-inline-start: calc(100% - 18px);
		}

		.ant-switch:hover {
			background: #9fb2cc;
		}
	`}
`
