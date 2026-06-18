'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Spin from '@/components/common/Spin'
import Empty from '@/components/common/Empty'
import Tag from '@/components/common/Tag'
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  TableOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@/components/common/antd/icons'
import Message from '@/components/common/Message'
import { HotTable } from '@handsontable/react'
import type { HotTableClass } from '@handsontable/react'
import { registerAllModules } from 'handsontable/registry'
import 'handsontable/styles/handsontable.css'
import 'handsontable/styles/ht-theme-main.css'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  useGetAiPdfUploadDetailQuery,
  useGetAiPdfLineItemFieldsQuery,
  useSyncAiPdfUploadMutation,
} from '@/store/services/aiPdf/apiSlice'
import type {
  AiPdfLineItemFieldOption,
  AiPdfLineItemMapping,
  AiPdfSyncPayload,
  AiPdfTable,
  AiPdfTableRow,
} from '@/store/services/aiPdf/types'
import Modal from '@/components/common/Modal'
import Select from '@/components/common/Select'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import Typography from '@/components/common/Typography'

registerAllModules()
const { Title, Text } = Typography

const createEmptyRule = () => ({
  column: '',
  value: '',
})

function mergeTables(tablesToMerge: AiPdfTable[]): AiPdfTable {
  const mergedColumns: { key: string; title: string }[] = []
  const titleToKey = new Map<string, string>()

  tablesToMerge.forEach((table) => {
    table.columns.forEach((col) => {
      if (!titleToKey.has(col.title)) {
        titleToKey.set(col.title, col.key)
        mergedColumns.push({ key: col.key, title: col.title })
      }
    })
  })

  const mergedRows: { rowData: Record<string, unknown> }[] = []

  tablesToMerge.forEach((table) => {
    const keyToTitle = new Map(table.columns.map((col) => [col.key, col.title]))

    table.rows.forEach((row) => {
      const normalizedRowData: Record<string, unknown> = {}
      mergedColumns.forEach((mergedCol) => {
        normalizedRowData[mergedCol.key] = 'NULL'
      })

      Object.entries(row.rowData).forEach(([sourceKey, value]) => {
        const title = keyToTitle.get(sourceKey)
        if (!title) return

        const mergedKey = titleToKey.get(title)
        if (!mergedKey) return
        normalizedRowData[mergedKey] = value
      })

      mergedRows.push({ rowData: normalizedRowData })
    })
  })

  return {
    id: `merged-${Date.now()}`,
    title: 'Merged Table',
    columns: mergedColumns,
    lineItemColumnMapping: null,
    rows: mergedRows,
  } as AiPdfTable
}

function PdfTableGrid({
  table,
  index,
  onDelete,
  onRowsChange,
  onLineItemMappingChange,
  lineItemFields,
}: {
  table: AiPdfTable
  index: number
  onDelete: () => void
  onRowsChange: (tableId: string, rows: AiPdfTableRow[]) => void
  onLineItemMappingChange: (tableId: string, mapping: AiPdfLineItemMapping) => void
  lineItemFields: AiPdfLineItemFieldOption[]
}) {
  const selectedRowsRef = useRef<number[]>([])
  const hotRef = useRef<HotTableClass>(null)
  const [bulkEditOpen, setBulkEditOpen] = useState(false)
  const [updateColumnsOpen, setUpdateColumnsOpen] = useState(false)
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [rules, setRules] = useState([createEmptyRule()])

  const colHeaders = useMemo(() => table.columns.map((c) => c.title), [table.columns])
  const columns = useMemo(() => table.columns.map((c) => ({ data: c.key })), [table.columns])
  const colWidths = useMemo(() => table.columns.map(() => 180), [table.columns])
  const data = useMemo(() => table.rows.map((r) => ({ __rowId: r.id, ...r.rowData })), [table.rows])
  const lineItemMapping = table.lineItemColumnMapping || {}

  const syncRowsFromGrid = () => {
    const hot = hotRef.current?.hotInstance
    if (!hot) return

    const sourceRows = hot.getSourceData() as Record<string, unknown>[]
    const existingById = new Map(table.rows.map((row) => [row.id, row]))

    const normalizedRows = sourceRows.map((sourceRow, rowIndex) => {
      const rowId =
        typeof sourceRow?.__rowId === 'string' && sourceRow.__rowId.trim().length > 0
          ? sourceRow.__rowId
          : ''

      const existingRow = rowId ? existingById.get(rowId) : undefined
      const rowData: Record<string, unknown> = {}
      table.columns.forEach((column) => {
        rowData[column.key] = sourceRow[column.key] === undefined ? null : sourceRow[column.key]
      })

      return {
        id: rowId,
        pdfTableId: table.id,
        rowData,
        rowIndex,
        isDeleted: false,
        createdAt: existingRow?.createdAt || '',
        updatedAt: existingRow?.updatedAt || '',
      }
    })

    onRowsChange(table.id, normalizedRows)
  }

  const addRule = () => setRules((prev) => [...prev, createEmptyRule()])
  const resetBulkEditModal = () => setRules([createEmptyRule()])
  const openBulkEditModal = () => {
    resetBulkEditModal()
    setBulkEditOpen(true)
  }
  const closeBulkEditModal = () => {
    setBulkEditOpen(false)
    resetBulkEditModal()
  }
  const removeRule = (index: number) => setRules((prev) => prev.filter((_, i) => i !== index))

  const updateRule = (index: number, key: 'column' | 'value', value: string) => {
    setRules((prev) => prev.map((rule, i) => (i === index ? { ...rule, [key]: value } : rule)))
  }

  const applyBulkEdit = () => {
    const hot = hotRef.current?.hotInstance
    if (!hot) return

    selectedRows.forEach((rowIndex) => {
      rules.forEach((rule) => {
        if (!rule.column) return
        hot.setDataAtRowProp(rowIndex, rule.column, rule.value)
      })
    })

    Message.success(`Updated ${selectedRows.length} rows`)
    closeBulkEditModal()
  }

  const updateLineItemMapping = (sourceColumnKey: string, targetField?: string) => {
    const nextMapping = { ...lineItemMapping }
    if (!targetField) {
      delete nextMapping[sourceColumnKey]
    } else {
      nextMapping[sourceColumnKey] = targetField
    }
    onLineItemMappingChange(table.id, nextMapping)
  }

  return (
    <div className={index > 0 ? 'border-t-2 border-slate-200' : undefined}>
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-md bg-violet-100 text-[11px] font-bold text-indigo-500">
            {index + 1}
          </span>
          <Title level={5} className="mb-0 text-sm font-semibold text-[#1d1f2b]">
            {table.title || `Table ${index + 1}`}
          </Title>
        </div>

        <div className="flex items-center gap-2">
          <Tag icon={<TableOutlined />} className="mr-0 rounded-md border-none bg-indigo-50 text-[12px] font-semibold text-indigo-500">
            {table.rows.length} rows
          </Tag>

          {selectedRows.length > 0 && (
            <Button type="primary" size="small" onClick={openBulkEditModal}>
              Edit ({selectedRows.length})
            </Button>
          )}

          <Button size="small" onClick={() => setUpdateColumnsOpen(true)}>
            Update Columns
          </Button>

          <Button
            variant="icon-button-2"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => setDeleteConfirmOpen(true)}
            title="Delete table"
          />
        </div>
      </div>

      <div className="[&_.handsontable]:font-inherit [&_.handsontable]:text-[13px] [&_.handsontable_td]:text-[#3d3f52] [&_.handsontable_th]:bg-slate-50 [&_.handsontable_th]:text-[12px] [&_.handsontable_th]:font-semibold [&_.handsontable_th]:text-[#1d1f2b]">
        {data.length === 0 ? (
          <div className="flex min-h-75 items-center justify-center">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<Text className="text-slate-400">No rows in this table</Text>} />
          </div>
        ) : (
          <HotTable
            ref={hotRef}
            data={data}
            colHeaders={colHeaders}
            columns={columns}
            colWidths={colWidths}
            rowHeaders={true}
            width="100%"
            height="auto"
            autoRowSize={true}
            autoColumnSize={false}
            stretchH="all"
            contextMenu={true}
            manualColumnResize={true}
            manualRowResize={true}
            filters={true}
            dropdownMenu={false}
            columnSorting={true}
            selectionMode="multiple"
            licenseKey="non-commercial-and-evaluation"
            enterBeginsEditing={true}
            afterChange={(changes, source) => {
              if (!changes || source === 'loadData') return
              syncRowsFromGrid()
            }}
            afterCreateRow={() => syncRowsFromGrid()}
            afterRemoveRow={() => syncRowsFromGrid()}
            afterSelectionEnd={(row, _col, row2) => {
              const rows: number[] = []
              const start = Math.min(row, row2)
              const end = Math.max(row, row2)
              for (let i = start; i <= end; i++) rows.push(i)

              selectedRowsRef.current = rows
              setSelectedRows((prev) => {
                if (prev.length === rows.length && prev.every((value, idx) => value === rows[idx])) {
                  return prev
                }
                return rows
              })
            }}
          />
        )}
      </div>

      <Modal open={bulkEditOpen} footer={null} onCancel={closeBulkEditModal} width={850}>
        <Title level={5} className="mb-6">Edit {selectedRows.length} rows</Title>
        <Text className="mb-6 block text-neutral-500">Pick columns, enter a shared value, and apply it to all selected rows.</Text>

        <div className="mb-6">
          <Button type="primary" icon={<PlusOutlined />} onClick={addRule}>
            Add field
          </Button>
        </div>

        {(() => {
          const selectedColumnKeys = new Set(rules.map((r) => r.column).filter((c): c is string => Boolean(c)))

          return rules.map((rule, idx) => {
            const availableColumns = table.columns.filter((c) => c.key === rule.column || !selectedColumnKeys.has(c.key))
            return (
              <div key={idx} className="mb-4 grid grid-cols-[220px_minmax(0,1fr)_44px] items-end gap-4">
                <div className="flex w-full flex-col gap-2">
                  <Text className="mb-2 block">Field</Text>
                  <Select
                    size="large"
                    placeholder="Select field"
                    value={rule.column || undefined}
                    onChange={(value) => updateRule(idx, 'column', value)}
                    options={availableColumns.map((c) => ({ label: c.title, value: c.key }))}
                    className="h-11 w-full"
                  />
                </div>

                <div className="flex w-full flex-col gap-2">
                  <Text className="mb-2 block">Value</Text>
                  <Input
                    size="large"
                    placeholder="Select a field first"
                    value={rule.value}
                    disabled={!rule.column}
                    onChange={(e) => updateRule(idx, 'value', e.target.value)}
                    className="h-11 w-full"
                  />
                </div>

                <div className="flex h-full items-end justify-center">
                  <Button variant="icon-button-2" icon={<DeleteOutlined />} onClick={() => removeRule(idx)} className="h-11 w-11" />
                </div>
              </div>
            )
          })
        })()}

        <div className="mt-6 flex justify-end gap-3">
          <Button onClick={closeBulkEditModal}>Cancel</Button>
          <Button type="primary" onClick={applyBulkEdit}>Apply changes</Button>
        </div>
      </Modal>

      <Modal open={updateColumnsOpen} footer={null} onCancel={() => setUpdateColumnsOpen(false)} width={880}>
        <Title level={5} style={{ marginBottom: 16 }}>Update Columns for {table.title || `Table ${index + 1}`}</Title>
        <Text style={{ display: 'block', marginBottom: 24, color: '#666' }}>
          Map each extracted table column to a LineItems database field. Sync will use this mapping to create or update LineItems records.
        </Text>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16, padding: '0 8px' }}>
          <Text strong>Extracted Table Column</Text>
          <Text strong>LineItems DB Column</Text>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {table.columns.map((column) => {
            const selectedTargetFields = new Set(
              Object.entries(lineItemMapping)
                .filter(([sourceKey]) => sourceKey !== column.key)
                .map(([, targetField]) => targetField)
            )

            const availableFieldOptions = lineItemFields.filter(
              (field) => field.key === lineItemMapping[column.key] || !selectedTargetFields.has(field.key)
            )

            return (
              <div key={column.key} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'center' }}>
                <div style={{ border: '1px solid #e8eaed', borderRadius: 8, background: '#fafbff', padding: '10px 12px' }}>
                  <Text style={{ display: 'block', fontWeight: 600 }}>{column.title}</Text>
                  <Text style={{ color: '#8b8fa8', fontSize: 12 }}>{column.key}</Text>
                </div>

                <Select
                  allowClear
                  placeholder="Select LineItems field"
                  value={lineItemMapping[column.key] || undefined}
                  onChange={(value) => updateLineItemMapping(column.key, value)}
                  options={availableFieldOptions.map((field) => ({ label: field.label, value: field.key }))}
                  style={{ width: '100%' }}
                />
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
          <Button onClick={() => setUpdateColumnsOpen(false)}>Close</Button>
        </div>
      </Modal>

      <Modal open={deleteConfirmOpen} footer={null} onCancel={() => setDeleteConfirmOpen(false)} width={420}>
        <Title level={5} className="mb-4">Delete this table?</Title>
        <Text className="mb-6 block text-neutral-500">
          {`"${table.title || `Table ${index + 1}`}" and its ${table.rows.length} row${table.rows.length === 1 ? '' : 's'} will be removed from this view. This won't affect the original PDF.`}
        </Text>

        <div className="flex justify-end gap-3">
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button danger type="primary" onClick={() => { setDeleteConfirmOpen(false); onDelete() }}>
            Delete table
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default function UploadDetailPage() {
  const params = useParams()
  const uploadId = params.id as string

  const { data: upload, isLoading, isError, refetch } = useGetAiPdfUploadDetailQuery(uploadId)
  const { data: lineItemFields = [] } = useGetAiPdfLineItemFieldsQuery()
  const [syncUpload, { isLoading: isSyncing }] = useSyncAiPdfUploadMutation()

  const [tables, setTables] = useState<AiPdfTable[]>([])
  const lastUploadIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!upload || lastUploadIdRef.current === upload.id) return
    lastUploadIdRef.current = upload.id
    setTables(
      upload.tables.map((table) => ({
        ...table,
        lineItemColumnMapping: table.lineItemColumnMapping || {},
      }))
    )
  }, [upload])

  const handleRowsChange = (tableId: string, rows: AiPdfTableRow[]) => {
    setTables((prev) => prev.map((table) => (table.id === tableId ? { ...table, rows } : table)))
  }

  const handleLineItemMappingChange = (tableId: string, mapping: AiPdfLineItemMapping) => {
    setTables((prev) =>
      prev.map((table) => (table.id === tableId ? { ...table, lineItemColumnMapping: mapping } : table))
    )
  }

  const buildSyncPayload = (currentTables: AiPdfTable[]): AiPdfSyncPayload => ({
    tables: currentTables.map((table) => ({
      ...(table.id && !table.id.startsWith('merged-') ? { id: table.id } : {}),
      title: table.title || null,
      columns: table.columns,
      lineItemMapping: table.lineItemColumnMapping || {},
      rows: table.rows.map((row, rowIndex) => ({
        ...(row.id ? { id: row.id } : {}),
        rowData: row.rowData,
        rowIndex: row.rowIndex ?? rowIndex,
      })),
    })),
  })

  const initialPayload = useMemo(() => JSON.stringify(buildSyncPayload(upload?.tables || [])), [upload])
  const currentPayload = useMemo(() => JSON.stringify(buildSyncPayload(tables)), [tables])
  const hasUnsyncedChanges = currentPayload !== initialPayload

  const handleSyncChanges = async () => {
    try {
      const payload = buildSyncPayload(tables)
      await syncUpload({ uploadId, payload }).unwrap()
      Message.success('Synced successfully')

      const refreshed = await refetch()
      if (refreshed.data) {
        setTables(
          refreshed.data.tables.map((table) => ({
            ...table,
            lineItemColumnMapping: table.lineItemColumnMapping || {},
          }))
        )
      }
    } catch (error: unknown) {
      const fallback = 'Failed to sync table changes'
      const err = error as { data?: { message?: string } }
      Message.error(err?.data?.message || fallback)
    }
  }

  const handleDeleteTable = (tableId: string) => {
    setTables((prev) => prev.filter((t) => t.id !== tableId))
    Message.success('Table removed')
  }

  const handleMergeTables = () => {
    if (tables.length < 2) {
      Message.error('Need at least 2 tables to merge')
      return
    }

    const merged = mergeTables(tables)
    setTables([merged])
    Message.success(`Merged ${tables.length} tables into one (${merged.columns.length} columns, ${merged.rows.length} rows)`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] p-8">
        <div className="flex min-h-75 items-center justify-center"><Spin size="large" /></div>
      </div>
    )
  }

  if (isError || !upload) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] p-8">
        <div className="flex min-h-75 items-center justify-center">
          <Empty description={<Text className="text-slate-400">Upload not found</Text>} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-8">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <Link href="/hottables">
          <Button
            icon={<ArrowLeftOutlined />}
            className="h-9 rounded-lg border border-slate-200 px-3 text-[13px] font-medium text-[#1d1f2b] hover:border-indigo-500! hover:text-indigo-500!"
          >
            Back to PDFs
          </Button>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5">
            <FileTextOutlined className="text-[13px] text-indigo-500" />
            <Text className="text-[13px] font-medium text-[#1d1f2b]">{upload.fileName}</Text>
          </div>

          <Tag className="rounded-md border-none bg-indigo-50 font-semibold text-indigo-500">
            {upload.tables.length} {upload.tables.length === 1 ? 'table' : 'tables'}
          </Tag>
        </div>
      </div>

      <Title level={3} className="mb-6 text-[22px] font-bold text-[#1d1f2b]">
        Extracted Tables
      </Title>

      {upload.tables.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<Text className="text-slate-400">No tables found in this upload</Text>}
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            {tables.map((table, index) => (
              <PdfTableGrid
                key={table.id}
                table={table}
                index={index}
                onDelete={() => handleDeleteTable(table.id)}
                onRowsChange={handleRowsChange}
                onLineItemMappingChange={handleLineItemMappingChange}
                lineItemFields={lineItemFields}
              />
            ))}
          </div>

          <div className="mt-5 flex justify-end gap-3">
            {tables.length >= 2 && <Button onClick={handleMergeTables}>Merge Tables</Button>}
            <Button
              type="primary"
              loading={isSyncing}
              disabled={!hasUnsyncedChanges}
              onClick={handleSyncChanges}
              className={!hasUnsyncedChanges ? 'blur-[0.6px] opacity-70' : undefined}
            >
              Sync Changes
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
