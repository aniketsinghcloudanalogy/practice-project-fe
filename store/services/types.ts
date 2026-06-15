export type ContactPayload = {
	firstName: string
	lastName?: string | null
	email: string
	primaryContact: string
	secondaryContact?: string | null
	company?: string | null
	notes?: string | null
}

export type ContactMessagePayload = ContactPayload & {
	subject: string
	message: string
}

export type Contact = ContactPayload & {
	id: string
	createdAt?: string
	updatedAt?: string
}

export type PdfColumn = {
	title: string
	key: string
	dataType: string
}

export type PdfExtractedTable = {
	title?: string
	columns: PdfColumn[]
	rows: Record<string, any>[]
}

export type PdfTableRow = Record<string, any> & {
	id: string
	rowIndex?: number | null
	rowHash?: string
	isDeleted?: boolean
}

export type PdfTable = {
	id: string
	sourceFileName?: string | null
	contentHash?: string | null
	title?: string | null
	schemaHash: string
	tableHash: string
	columns: PdfColumn[]
	rows: PdfTableRow[]
	isDeleted?: boolean
	createdAt?: string
	updatedAt?: string
}

export type MergedExtractedTable = {
	title?: string | null
	schemaHash: string
	columns: PdfColumn[]
	rows: Record<string, any>[]
	sourceFileNames: string[]
	sourceTableIds: string[]
}

export type MergedExtractedData = {
	tables: MergedExtractedTable[]
}

export type StructuredExtractedData = {
	columns: PdfColumn[]
	rows: Record<string, any>[]
}

export type MultiTableExtractedData = {
	tables: PdfExtractedTable[]
}

export type ExtractedData = StructuredExtractedData | MultiTableExtractedData | Record<string, unknown> | unknown[]

export type PdfDocument = PdfTable

export type UploadPdfSummary = {
	tableCount: number
	insertedTables: number
	duplicateTables: number
	insertedRows: number
	duplicateRows: number
}

export type PdfRow = PdfDocument

export type UpdateExtractedDataPayload = {
	id: string
	extractedData: ExtractedData
}

export type CreatePdfTablePayload = {
	title?: string | null
	columns: PdfColumn[]
	rows: Record<string, any>[]
	sourceFileName?: string | null
	contentHash?: string | null
}

export type UpdatePdfTablePayload = {
	tableId: string
	title?: string | null
	columns?: PdfColumn[]
	rows?: Record<string, any>[]
}

export type CreatePdfTableRowPayload = {
	tableId: string
	rowData: Record<string, any>
}

export type UpdatePdfTableRowPayload = {
	tableId: string
	rowId: string
	rowData: Record<string, any>
}

export type BulkUpdatePdfTableRowsPayload = {
	tableId: string
	updates: Record<string, Record<string, unknown>>
}

export type BulkUpdatePdfTableRowsResponse = {
	count: number
	table: PdfTable
}

export type BulkDeletePdfTableRowsPayload = {
	tableId: string
	rowIds: string[]
}

export type BulkDeletePdfTableRowsResponse = {
	count: number
	table: PdfTable
}

export type ApiResponse<T> = {
	statusCode?: number
	success?: boolean
	message?: string
	data: T
}
