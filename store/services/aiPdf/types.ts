import type { ApiResponse } from '../types'

// ─── Column ───────────────────────────────────────────────────────────────────

export type AiPdfColumn = {
  title: string
  key: string
  dataType: string
}

export type AiPdfLineItemFieldOption = {
  key: string
  label: string
}

export type AiPdfLineItemMapping = Record<string, string>

// Derived client-side from upload tables + rows, not a persisted DB record.
export type AiPdfLineItemRow = {
  rowSourceId: string | null
  pdfTableId: string
  sourceTableTitle: string | null
  rowIndex: number | null
  lineNumber?: string | null
  itemCode?: string | null
  employeeId?: string | null
  employeeName?: string | null
  description?: string | null
  department?: string | null
  category?: string | null
  email?: string | null
  phone?: string | null
  salary?: string | null
  quantity?: string | null
  unitPrice?: string | null
  amount?: string | null
  currency?: string | null
  status?: string | null
  referenceNo?: string | null
  location?: string | null
  notes?: string | null
  [key: string]: unknown
}

// ─── Row ─────────────────────────────────────────────────────────────────────

export type AiPdfTableRow = {
  id: string
  pdfTableId: string
  rowData: Record<string, any>
  rowIndex: number | null
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

// ─── Table ───────────────────────────────────────────────────────────────────

export type AiPdfTable = {
  id: string
  pdfUploadId: string
  userId: string
  title: string | null
  columns: AiPdfColumn[]
  lineItemColumnMapping?: AiPdfLineItemMapping | null
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  rows: AiPdfTableRow[]       // ← was pdfTableRows, matches Prisma relation name
}

// ─── Upload ──────────────────────────────────────────────────────────────────

export type AiPdfUpload = {
  id: string
  fileName: string
  userId: string
  createdAt: string
  updatedAt: string
  tables: AiPdfTable[]        // ← was pdfTables, matches Prisma relation name
}

// ─── Upload List Item (GET /aipdf) ───────────────────────────────────────────

export type AiPdfUploadListItem = {
  id: string
  fileName: string
  createdAt: string
  updatedAt: string
  _count: {
    tables: number
  }
}

// ─── Extract response (POST /aipdf/extract) ──────────────────────────────────

export type AiPdfExtractSummary = {
  uploadId: string
  tableCount: number
  tables: {
    tableId: string
    rowCount: number
  }[]
}

// ─── Sync request/response (PUT /aipdf/:uploadId/sync) ──────────────────────
export type AiPdfSyncRowInput = {
  id?: string
  rowData: Record<string, any>
  rowIndex?: number
}

export type AiPdfSyncTableInput = {
  id?: string
  title?: string | null
  columns: AiPdfColumn[]
  lineItemMapping?: AiPdfLineItemMapping
  rows: AiPdfSyncRowInput[]
}

export type AiPdfSyncPayload = {
  tables: AiPdfSyncTableInput[]
}

export type AiPdfSyncSummary = {
  uploadId: string
}

export type AiPdfDeleteSummary = {
  uploadId: string
  deletedTables: number
}
// ─── API Response wrappers ───────────────────────────────────────────────────

export type AiPdfUploadListResponse = ApiResponse<{ uploads: AiPdfUploadListItem[] }>
export type AiPdfUploadDetailResponse = ApiResponse<{ upload: AiPdfUpload }>
export type AiPdfExtractResponse = ApiResponse<AiPdfExtractSummary>
export type AiPdfSyncResponse = ApiResponse<AiPdfSyncSummary>
export type AiPdfDeleteResponse = ApiResponse<AiPdfDeleteSummary>
