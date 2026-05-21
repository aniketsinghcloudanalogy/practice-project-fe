"use client";

import AntTable from '../antd/Table'
import { StyledTableWrapper } from './styles'
import type { AppTableProps } from './types'

const Table = <RecordType extends object = object>({ variant = 'default', ...props }: AppTableProps<RecordType>) => {
	return (
		<StyledTableWrapper $variant={variant}>
			<AntTable<RecordType> {...props} />
		</StyledTableWrapper>
	)
}

export default Table