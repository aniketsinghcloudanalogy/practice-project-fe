import { createSelector } from '@reduxjs/toolkit'
import { quoteApi } from '@/store/services/quote/apiSlice'
import type { QuoteExtractedTable, QuoteLineItem } from '@/store/services/quote/types'

const EXCLUDED_LINE_ITEM_COLUMN_KEYS = new Set(['createdat', 'updatedat', 'created_at', 'updated_at'])

const normalizeColumnName = (column: unknown): string | null => {
  if (typeof column === 'string') {
    const trimmed = column.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  if (!column || typeof column !== 'object') return null

  const record = column as Record<string, unknown>
  const candidates = [record.key, record.label, record.title, record.name, record.header, record.field]
  const match = candidates.find((value) => typeof value === 'string' && value.trim().length > 0)

  return typeof match === 'string' ? match.trim() : null
}

const isExcluded = (name: string) => EXCLUDED_LINE_ITEM_COLUMN_KEYS.has(name.trim().toLowerCase())

const normalizeRowDataForTable = (rowData: unknown, columns: unknown[] = []): Record<string, unknown> => {
  if (rowData && typeof rowData === 'object' && !Array.isArray(rowData)) {
    return rowData as Record<string, unknown>
  }

  if (Array.isArray(rowData)) {
    const columnNames = columns.map((column, index) => normalizeColumnName(column) || `column_${index + 1}`)

    return rowData.reduce<Record<string, unknown>>((acc, value, index) => {
      acc[columnNames[index] || `column_${index + 1}`] = value
      return acc
    }, {})
  }

  return { value: rowData ?? null }
}

const collectUniqueColumnNames = (table: QuoteExtractedTable): string[] => {
  const names: string[] = []
  const seen = new Set<string>()
  const columns = Array.isArray(table.columns) ? table.columns : []

  for (const column of columns) {
    const normalized = normalizeColumnName(column)
    if (!normalized || isExcluded(normalized)) continue
    const identity = normalized.toLowerCase()
    if (seen.has(identity)) continue
    seen.add(identity)
    names.push(normalized)
  }

  if (names.length > 0) return names

  const rows = Array.isArray(table.rows) ? table.rows : []
  for (const row of rows) {
    const rowData = normalizeRowDataForTable(row.rowData, columns)

    for (const key of Object.keys(rowData)) {
      const normalized = key.trim()
      if (!normalized || isExcluded(normalized)) continue
      const identity = normalized.toLowerCase()
      if (seen.has(identity)) continue
      seen.add(identity)
      names.push(normalized)
    }
  }

  return names
}

const deriveLineItemsFromTables = (tables: QuoteExtractedTable[] = []): QuoteLineItem[] => {
  const lineItems: QuoteLineItem[] = []
  const globalSeen = new Set<string>()

  for (const table of tables) {
    const names = collectUniqueColumnNames(table)

    for (const name of names) {
      const key = `${table.id}:${name.toLowerCase()}`
      if (globalSeen.has(key)) continue
      globalSeen.add(key)

      lineItems.push({
        id: key,
        lineNumber: String(lineItems.length + 1),
        description: name,
        columnName: name,
        pdfTableId: table.id,
        sourceTableTitle: table.title ?? null,
        rowIndex: lineItems.length,
      })
    }
  }

  return lineItems
}

export const selectDerivedLineItems = createSelector([(tables: QuoteExtractedTable[] = []) => tables], (tables) =>
  deriveLineItemsFromTables(tables)
)

export const selectDerivedLineItemsByFileId = (quoteId: string) =>
  createSelector(quoteApi.endpoints.getQuoteDetail.select(quoteId), (result) => {
    const files = result.data?.files ?? []

    return files.reduce<Record<string, QuoteLineItem[]>>((acc, file) => {
      acc[file.id] = deriveLineItemsFromTables(file.tables ?? [])
      return acc
    }, {})
  })

export const selectDerivedTotalLineItemCount = (quoteId: string) =>
  createSelector(selectDerivedLineItemsByFileId(quoteId), (lineItemsByFileId) =>
    Object.values(lineItemsByFileId).reduce((sum, items) => sum + items.length, 0)
  )
