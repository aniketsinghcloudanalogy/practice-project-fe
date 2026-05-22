"use client";

import styled from 'styled-components'

export const StyledInputWrapper = styled.div<{ $appearance: string }>`
	.ant-input,
	.ant-input-affix-wrapper,
	.ant-input-password {
		width: 100%;
		min-height: 44px;
		border-radius: 16px;
		border-color: #cbd5e1;
		background: #ffffff;
		display: flex;
		align-items: center;
		box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
		transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
	}

	.ant-input-affix-wrapper {
		overflow: hidden;
	}

	.ant-input,
	.ant-input-affix-wrapper input,
	.ant-input-password input {
		background: transparent;
		box-shadow: none;
		height: 100%;
		padding-top: 0;
		padding-bottom: 0;
		line-height: 1.5;
	}

	.ant-input-prefix,
	.ant-input-suffix {
		display: flex;
		align-items: center;
	}

	.ant-input:-webkit-autofill,
	.ant-input:-webkit-autofill:hover,
	.ant-input:-webkit-autofill:focus,
	.ant-input-affix-wrapper input:-webkit-autofill,
	.ant-input-affix-wrapper input:-webkit-autofill:hover,
	.ant-input-affix-wrapper input:-webkit-autofill:focus,
	.ant-input-password input:-webkit-autofill,
	.ant-input-password input:-webkit-autofill:hover,
	.ant-input-password input:-webkit-autofill:focus {
		-webkit-box-shadow: 0 0 0 1000px #f8fbff inset !important;
		-webkit-text-fill-color: #0f172a !important;
		box-shadow: 0 0 0 1000px #f8fbff inset !important;
		caret-color: #0f172a;
	}

	.ant-input-affix-wrapper:hover,
	.ant-input:hover,
	.ant-input-password:hover {
		border-color: #1d4ed8;
		background: #ffffff;
	}

	.ant-input-affix-wrapper:focus,
	.ant-input-affix-wrapper-focused,
	.ant-input:focus,
	.ant-input-focused,
	.ant-input-password:focus,
	.ant-input-password-focused {
		border-color: #1d4ed8;
		box-shadow: 0 0 0 4px rgba(29, 78, 216, 0.12);
	}

	${({ $appearance }) =>
		$appearance === 'soft' &&
		`
		.ant-input,
		.ant-input-affix-wrapper,
		.ant-input-password {
			background: #f8fbff;
			border-color: #94a3b8;
		}

		.ant-input,
		.ant-input-affix-wrapper input,
		.ant-input-password input {
			background: transparent;
		}

		.ant-input:-webkit-autofill,
		.ant-input:-webkit-autofill:hover,
		.ant-input:-webkit-autofill:focus,
		.ant-input-affix-wrapper input:-webkit-autofill,
		.ant-input-affix-wrapper input:-webkit-autofill:hover,
		.ant-input-affix-wrapper input:-webkit-autofill:focus,
		.ant-input-password input:-webkit-autofill,
		.ant-input-password input:-webkit-autofill:hover,
		.ant-input-password input:-webkit-autofill:focus {
			-webkit-box-shadow: 0 0 0 1000px #f8fbff inset !important;
			-webkit-text-fill-color: #0f172a !important;
			box-shadow: 0 0 0 1000px #f8fbff inset !important;
		}

		.ant-input-affix-wrapper:hover,
		.ant-input:hover,
		.ant-input-password:hover,
		.ant-input-affix-wrapper-focused,
		.ant-input-focused,
		.ant-input-password-focused {
			border-color: #1d4ed8;
		}
	`}
`