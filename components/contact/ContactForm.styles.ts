"use client";

import styled from 'styled-components'

export const FormPanel = styled.div`
	border: 1px solid #dbe3ef;
	border-radius: 8px;
	background: #ffffff;
	padding: clamp(24px, 3vw, 42px);
	box-shadow: 0 18px 55px rgba(15, 23, 42, 0.08);
	min-width: 0;

	.ant-form-item {
		margin-bottom: 18px;
	}

	.ant-input-affix-wrapper,
	.ant-input,
	.ant-input-textarea textarea {
		border-radius: 8px;
	}

	@media (max-width: 640px) {
		padding: 20px 16px;

		.ant-form-item {
			margin-bottom: 15px;
		}
	}
`

export const FormHeader = styled.div`
	margin-bottom: clamp(20px, 2.4vw, 28px);
`

export const FormEyebrow = styled.p`
	margin: 0 0 8px;
	color: #2563eb;
	font-size: 13px;
	font-weight: 700;
	text-transform: uppercase;
`

export const FormTitle = styled.h2`
	margin: 0;
	color: #0f172a;
	font-size: clamp(24px, 2.2vw, 32px);
	font-weight: 740;
	letter-spacing: 0;
	line-height: 1.15;
`

export const FormDescription = styled.p`
	margin: 10px 0 0;
	max-width: 620px;
	color: #64748b;
	font-size: 14px;
	line-height: 1.65;
`

export const FieldGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	column-gap: 14px;

	@media (max-width: 760px) {
		grid-template-columns: 1fr;
	}
`

export const SubmitRow = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	margin-top: 4px;

	@media (max-width: 640px) {
		align-items: stretch;
		flex-direction: column;

		.ant-btn {
			width: 100%;
		}
	}
`

export const HelperText = styled.p`
	margin: 0;
	max-width: 300px;
	color: #64748b;
	font-size: 12px;
	line-height: 1.5;

	@media (max-width: 640px) {
		max-width: none;
	}
`
