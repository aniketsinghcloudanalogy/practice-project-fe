import type { TableProps } from '@/components/common/antd/Table'

export interface AppTableProps<RecordType extends object = object> extends TableProps<RecordType> {
	variant?: 'default' | 'compact'
}