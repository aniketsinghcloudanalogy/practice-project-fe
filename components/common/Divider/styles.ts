"use client";

import styled from 'styled-components'

export const StyledDividerWrapper = styled.div`
	.ant-divider {
		margin: 0;
	}

	.ant-divider-horizontal {
		border-top: none;
		position: relative;
		padding: 1px 0;
	}

	.ant-divider-horizontal::before,
	.ant-divider-horizontal::after {
		background: rgba(30,58,138,0.08);
		height: 2px;
		content: "";
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		width: 45%;
	}

	.ant-divider-horizontal::before {
		left: 0;
	}

	.ant-divider-horizontal::after {
		right: 0;
	}

	.ant-divider-inner-text {
		color: rgba(15,23,42,0.6);
		font-weight: 600;
		background: transparent;
		padding: 0 12px;
	}
`