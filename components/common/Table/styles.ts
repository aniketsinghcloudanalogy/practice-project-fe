"use client";

import styled from 'styled-components'

export const StyledTableWrapper = styled.div<{ $variant: string }>`
	.ant-table {
		border-radius: 12px;
	}

	${({ $variant }) =>
		$variant === 'compact' &&
		`
		.ant-table-thead > tr > th,
		.ant-table-tbody > tr > td {
			padding: 8px 12px;
		}
	`}
`