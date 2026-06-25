"use client";

import styled from 'styled-components'

export const StyledCollapseWrapper = styled.div<{ $variant: string }>`
	.ant-collapse {
		border-radius: 12px;
		overflow: hidden;
	}

	.ant-collapse > .ant-collapse-item > .ant-collapse-header {
		align-items: center;
		min-height: 52px;
		font-weight: 600;
	}

	${({ $variant }) =>
		$variant === 'soft' &&
		`
		.ant-collapse {
			background: #f8fafc;
			border-color: #e2e8f0;
		}

		.ant-collapse > .ant-collapse-item > .ant-collapse-header {
			background: #f8fafc;
			color: #334155;
		}

		.ant-collapse-content {
			background: #ffffff;
		}
	`}

	${({ $variant }) =>
		$variant === 'panel' &&
		`
		.ant-collapse {
			background: #ffffff;
			border: 1px solid #cbd5e1;
			box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
		}

		.ant-collapse > .ant-collapse-item {
			border-bottom-color: #e2e8f0;
		}

		.ant-collapse > .ant-collapse-item > .ant-collapse-header {
			padding: 14px 18px;
			color: #0f172a;
		}

		.ant-collapse-content-box {
			padding: 16px 18px 20px;
		}
	`}
`
