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

	${({ $variant }) =>
		$variant === 'panel' &&
		`
		.ant-select-selector {
			min-height: 48px !important;
			border-radius: 16px !important;
			background: #ffffff !important;
			border-color: #cbd5e1 !important;
			box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
			padding-inline: 12px !important;
		}

		.ant-select-selection-placeholder,
		.ant-select-selection-item {
			line-height: 48px !important;
			color: #64748b;
		}

		.ant-select-arrow {
			color: #243b63;
		}

		.ant-select-focused .ant-select-selector,
		.ant-select:hover .ant-select-selector {
			border-color: #243b63 !important;
			box-shadow: 0 0 0 4px rgba(36, 59, 99, 0.1) !important;
		}
	`}
`