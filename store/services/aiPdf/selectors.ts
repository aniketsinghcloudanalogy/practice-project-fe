import { createSelector } from '@reduxjs/toolkit'
import { aiPdfApi } from './apiSlice'
import { LINE_ITEM_FIELD_KEYS } from './constants'
import type { AiPdfLineItemRow } from './types'

// Factory selector: memoized per upload id cache entry.
export const selectDerivedLineItems = (uploadId: string) =>
  createSelector(aiPdfApi.endpoints.getAiPdfUploadDetail.select(uploadId), (result): AiPdfLineItemRow[] => {
    const tables = result.data?.tables ?? []
    const out: AiPdfLineItemRow[] = []

    for (const table of tables) {
      const mapping = table.lineItemColumnMapping
      if (!mapping || Object.keys(mapping).length === 0) {
        continue
      }

      const cleanMapping = Object.fromEntries(
        Object.entries(mapping).filter(([, targetField]) => LINE_ITEM_FIELD_KEYS.has(targetField))
      )
      const mappingEntries = Object.entries(cleanMapping)
      if (mappingEntries.length === 0) {
        continue
      }

      for (const row of table.rows) {
        const lineItem: AiPdfLineItemRow = {
          rowSourceId: row.id,
          pdfTableId: table.id,
          sourceTableTitle: table.title ?? null,
          rowIndex: row.rowIndex ?? null,
        }

        for (const [sourceColumn, targetField] of mappingEntries) {
          lineItem[targetField] = row.rowData?.[sourceColumn] ?? null
        }

        out.push(lineItem)
      }
    }

    return out.sort((a, b) => {
      const titleOrder = (a.sourceTableTitle ?? '').localeCompare(b.sourceTableTitle ?? '')
      if (titleOrder !== 0) {
        return titleOrder
      }
      return (a.rowIndex ?? 0) - (b.rowIndex ?? 0)
    })
  })
