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
		$variant === 'logout' &&
		`
		.ant-btn {
			background: #fff1f2; /* soft pink */
			border-color: #fecaca; /* light rose */
			color: #b91c1c; /* red-700 */
			border-radius: 8px;
			box-shadow: 0 1px 4px rgba(185, 28, 28, 0.06);
			padding: 4px 20px;
			height: 30px;
			font-weight: 600;
			transition: all 0.15s ease;
			display: block;
			width: 100%;
			text-align: left;
		}

		.ant-btn:hover,
		.ant-btn:focus {
			background: #fde8ea; /* slightly darker soft pink */
			border-color: #fca5a5 !important;
			color: #7f1d1d !important;
			box-shadow: 0 6px 18px rgba(190, 18, 60, 0.08) !important;
			outline: none !important;
			transform: translateY(-1px);
		}
	`}

	${({ $variant }) =>
		$variant === 'auth' &&
		`
		.ant-btn {
			background: #ffffff;
			border-color: #cbd5e1;
			color: #1e293b;		
			border-radius: 9999px;
			box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
			transition: all 0.2s ease;
		}

		.ant-btn:hover,
		.ant-btn:focus {
			background: linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%);
			border-color: #93c5fd !important;
			color: #1e293b !important;
			box-shadow: 0 10px 22px rgba(59, 130, 246, 0.12) !important;
			outline: none !important;
			transform: translateY(-1px);
			-webkit-box-shadow: 0 10px 22px rgba(59, 130, 246, 0.12) !important;
		}
	`}

	${({ $variant }) =>
		$variant === 'signin' &&
		`
		.ant-btn {
			background: linear-gradient(180deg, #60a5fa 0%, #2563eb 100%);
			border-color: #2563eb;
			color: #ffffff;
			width: 100%;
			border-radius: 9999px;
			box-shadow: 0 14px 30px rgba(37, 99, 235, 0.22);
		}
					
		.ant-btn:hover,
		.ant-btn:focus,
		.ant-btn:hover *,
		.ant-btn:focus * {
			color: #000000 !important;
			font-weight: 700 !important;
		}
	`}

	${({ $variant }) =>
		$variant === 'dropdown' &&
		`
		.ant-btn {
			background: #ffffff;
			border-color: #e6e6e6;
			color: #0f172a;
			border-radius: 8px;
			padding: 4px 20px;
			height: 30px;
			font-weight: 600;
			display: block;
			width: 100%;
			text-align: left;
		}

		.ant-btn:hover,
		.ant-btn:focus {
			background: #f8fafc;
			border-color: #d1d5db !important;
			color: #0b1220 !important;
		}
	`}
`
