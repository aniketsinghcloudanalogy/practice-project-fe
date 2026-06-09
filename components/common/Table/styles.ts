"use client";

import styled from 'styled-components'

export const StyledTableWrapper = styled.div<{ $variant: string }>`
	.ant-table {
		border-radius: 12px;
	}

	/* row borders */
	.ant-table-tbody > tr > td {
		border-bottom: 1px solid #f0f0f0;
	}

	/* column borders */
	.ant-table-thead > tr > th,
	.ant-table-tbody > tr > td {
		border-right: 1px solid #f0f0f0;
	}

	.ant-table-thead > tr > th:last-child,
	.ant-table-tbody > tr > td:last-child {
		border-right: none;
	}

	/* header bottom border */
	.ant-table-thead > tr > th {
		border-bottom: 1px solid #3f6687;
		background-color: #587d9d !important;
		color: #ffffff !important;
		font-size: 13px !important;
		font-weight: 700 !important;
		letter-spacing: 0.02em;
		text-transform: none;
	}

	/* body cell text */
	.ant-table-tbody > tr > td {
		color: #374151;
		font-size: 14px;
	}

	/* subtle row hover */
	.ant-table-tbody > tr:hover > td {
		background-color: #f5f7ff !important;
	}

	${({ $variant }) =>
		$variant === 'compact' &&
		`
		.ant-table-thead > tr > th,
		.ant-table-tbody > tr > td {
			padding: 8px 12px;
		}

		.ant-pagination {
			margin-top: 12px;
			padding-right: 4px;
		}

		.ant-pagination-prev,
		.ant-pagination-next {
			margin: 0 6px;
		}

		.ant-pagination-item {
			margin-inline-end: 6px;
		}
	`}
`