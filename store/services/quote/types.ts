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

export type QuoteLineItem = Record<string, unknown> & {
	id: string
	quoteFileId?: string
	rowIndex?: number | null
	isDeleted?: boolean
}

export type QuoteFile = {
	id: string
	quote_id: string
	pdf_upload_id: string
	file_name: string
	created_at: string
	updated_at: string
	lineItems: QuoteLineItem[]
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

export type QuoteMutationData = {
	quote: QuoteMutationQuote
	files: QuoteFile[]
	lineItemCount: number
}

export type QuoteListResponse = ApiResponse<{ quotes: QuoteListItem[] }>
export type QuoteDetailResponse = ApiResponse<QuoteDetail>
export type QuoteMutationResponse = ApiResponse<QuoteMutationData>
