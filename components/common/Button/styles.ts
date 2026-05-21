"use client";

import styled from 'styled-components'

export const StyledButtonWrapper = styled.div<{ $variant: string }>`
	.ant-btn {
		height: 44px;
		border-radius: 8px;
		font-weight: 600;
	}

	${({ $variant }) =>
		$variant === 'primary' &&
		`
		.ant-btn {
			background: #1677ff;
			border-color: #1677ff;
			color: #ffffff;
		}
	`}

	${({ $variant }) =>
		$variant === 'secondary' &&
		`
		.ant-btn {
			background: #f5f5f5;
			border-color: #d9d9d9;
			color: #111827;
		}
	`}

	${({ $variant }) =>
		$variant === 'danger' &&
		`
		.ant-btn {
			background: #ef4444;
			border-color: #ef4444;
			color: #ffffff;
		}
	`}

	${({ $variant }) =>
		$variant === 'auth' &&
		`
		.ant-btn {
			background: linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%);
			border-color: #93c5fd;
			color: #1d4ed8;
			box-shadow: 0 10px 22px rgba(59, 130, 246, 0.12);
		}

		.ant-btn:hover,
		.ant-btn:focus {
			background: linear-gradient(180deg, #dbeafe 0%, #bfdbfe 100%);
			border-color: #1e40af !important;
			color: #1e40af !important;
			box-shadow: 0 14px 28px rgba(29, 78, 216, 0.18) !important;
			outline: none !important;
			-webkit-box-shadow: 0 14px 28px rgba(29, 78, 216, 0.18) !important;
		}
	`}

	${({ $variant }) =>
		$variant === 'signin' &&
		`
		.ant-btn {
			background: linear-gradient(180deg, #60a5fa 0%, #2563eb 100%);
			border-color: #2563eb;
			color: #ffffff;
			box-shadow: 0 14px 30px rgba(37, 99, 235, 0.22);
		}

		.ant-btn:hover,
		.ant-btn:focus {
			background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%);
			border-color: #1d4ed8;
			color: #ffffff;
			box-shadow: 0 18px 34px rgba(37, 99, 235, 0.26);
		}
	`}
`