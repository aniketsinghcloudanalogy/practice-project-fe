import type { ApiResponse } from '../types'

// ─── Column ───────────────────────────────────────────────────────────────────

export type AiPdfColumn = {
  title: string
  key: string
  dataType: string
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
  rows: AiPdfSyncRowInput[]
}

export type AiPdfSyncPayload = {
  tables: AiPdfSyncTableInput[]
}

export type AiPdfSyncSummary = {
  uploadId: string
  summary: {
    createdTables: number
    updatedTables: number
    deletedTables: number
    createdRows: number
    updatedRows: number
    deletedRows: number
  }
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