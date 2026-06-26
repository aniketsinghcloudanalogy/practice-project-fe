"use client";

import styled from 'styled-components'

export const StyledTabsWrapper = styled.div<{ $variant: string }>`
	.ant-tabs-nav {
		margin: 0 0 14px;
	}

	.ant-tabs-tab {
		font-weight: 600;
	}

	${({ $variant }) =>
		$variant === 'compact' &&
		`
		.ant-tabs-nav {
			margin: 0 0 10px;
		}

		.ant-tabs-tab {
			padding: 8px 12px;
			font-size: 13px;
			border-radius: 8px;
			transition: all 0.2s ease;
		}

		.ant-tabs-tab:hover {
			color: #1d3557;
		}

		.ant-tabs-tab-active {
			background: #eff6ff;
		}

		.ant-tabs-ink-bar {
			height: 2px;
			background: #243b63;
		}
	`}
`
