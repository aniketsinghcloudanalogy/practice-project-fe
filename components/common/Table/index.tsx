"use client";

import AntTable from '../antd/Table'
import { StyledTableWrapper } from './styles'
import type { AppTableProps } from './types'

type TableComponent = (<RecordType extends object = object>(props: AppTableProps<RecordType>) => React.ReactElement) & {
	EXPAND_COLUMN: typeof AntTable.EXPAND_COLUMN
}

const TableBase = <RecordType extends object = object>({ variant = 'default', ...props }: AppTableProps<RecordType>) => {
	return (
		<StyledTableWrapper $variant={variant}>
			<AntTable<RecordType> {...props} />
		</StyledTableWrapper>
	)
}

const Table = Object.assign(TableBase, {
	EXPAND_COLUMN: AntTable.EXPAND_COLUMN,
}) as TableComponent

export default Table