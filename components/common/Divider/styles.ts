"use client";

import styled from 'styled-components'

export const StyledDividerWrapper = styled.div`
	.ant-divider {
		margin: 0;
	}

	.ant-divider-horizontal {
		border-top: none !important;
		position: relative;
		padding: 6px 0;
	}

	/* Hide AntD default lines to avoid double lines */
	.ant-divider::before,
	.ant-divider::after {
		display: none !important;
	}

	/* Custom single thin separators on each side */
	.ant-divider-horizontal::before,
	.ant-divider-horizontal::after {
		background: rgba(15,23,42,0.12);
		height: 1px;
		content: "";
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		width: 46%;
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
		background: #ffffff;
		padding: 0 12px;
		z-index: 2;
	}
`