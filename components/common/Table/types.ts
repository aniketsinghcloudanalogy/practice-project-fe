import type { TableProps, ColumnsType } from '@/components/common/antd/Table'

export type { ColumnsType }
export interface AppTableProps<RecordType extends object = object> extends TableProps<RecordType> {
	variant?: 'default' | 'compact'
}