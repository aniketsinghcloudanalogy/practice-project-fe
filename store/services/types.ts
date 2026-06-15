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

export type StructuredExtractedData = {
	columns: PdfColumn[]
	rows: Record<string, any>[]
}

export type MultiTableExtractedData = {
	tables: PdfExtractedTable[]
}

export type ExtractedData = StructuredExtractedData | MultiTableExtractedData | Record<string, unknown> | unknown[]

export type PdfDocument = {
	id: string
	userId: string
	fileName: string
	filePath: string
	extractedText: string
	extractedData: ExtractedData | null
	createdAt: string
	updatedAt: string
}

export type PdfRow = PdfDocument

export type UpdateExtractedDataPayload = {
	id: string
	extractedData: ExtractedData
}

export type ApiResponse<T> = {
	statusCode?: number
	success?: boolean
	message?: string
	data: T
}
