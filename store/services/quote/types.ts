import type { ApiResponse } from '../types'

export type QuoteListItem = {
	id: string
	quoteIndex: number
	formattedQuoteNumber: string
	name: string
	pdfUrl: string | null
	status: string | null
	fileCount: number
	lineItemCount: number
	createdAt?: string | null
}

export type QuoteMutationQuote = {
	id: string
	userId: string
	quote_number: number
	name: string
	pdf_url: string | null
	status: string | null
	created_at?: string | null
	updated_at?: string | null
	quoteIndex: number
	pdfUrl: string | null
	formattedQuoteNumber: string
}

export type QuoteLineItem = {
  id: string
  lineNumber: string
  description: string
  columnName: string
  pdfTableId: string
  sourceTableTitle: string | null
  rowIndex: number
}

export type QuoteExtractedTableRow = {
	id: string
	rowIndex: number | null
	rowData: Record<string, unknown>
}

export type QuoteExtractedTable = {
	id: string
	title: string | null
	columns: unknown[]
	rows: QuoteExtractedTableRow[]
}

export type QuoteFile = {
	id: string
	quote_id: string
	pdf_upload_id: string
	file_name: string
	is_Verifed?: boolean
	isVerified?: boolean
	created_at: string
	updated_at: string
	lineItems: QuoteLineItem[]
	tables?: QuoteExtractedTable[]
}

export type QuoteDetail = {
	quote: {
		id: string
		userId: string
		quoteIndex: number
		formattedQuoteNumber: string
		name: string
		pdfUrl: string | null
		status: string | null
		createdAt?: string | null
		updatedAt?: string | null
	}
	files: QuoteFile[]
	counts: {
		fileCount: number
		lineItemCount: number
	}
}

export type CreateQuotePayload = {
	name: string
	files: File[]
}

export type AddQuoteFilesPayload = {
	quoteId: string
	files: File[]
}

export type VerifyQuoteFilePayload = {
	quoteId: string
	quoteFileId: string
}

export type QuoteMutationData = {
	quote: QuoteMutationQuote
	files: QuoteFile[]
	lineItemCount: number
	extractedRowCount?: number
}

export type QuoteListResponse = ApiResponse<{ quotes: QuoteListItem[] }>
export type QuoteDetailResponse = ApiResponse<QuoteDetail>
export type QuoteMutationResponse = ApiResponse<QuoteMutationData>
export type VerifyQuoteFileResponse = ApiResponse<{ file: QuoteFile }>
