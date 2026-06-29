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
    EditOutlined,
} from '@/components/common/antd/icons'
import Message from '@/components/common/Message'
import { HotTable } from '@handsontable/react'
import type { HotTableClass } from '@handsontable/react'
import { registerAllModules } from 'handsontable/registry'
import 'handsontable/styles/handsontable.css'
import 'handsontable/styles/ht-theme-main.css'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import {
    useGetAiPdfUploadDetailQuery,
    useSyncAiPdfUploadMutation,
} from '@/store/services/aiPdf/apiSlice'
import { LINE_ITEM_FIELD_OPTIONS } from '@/store/services/aiPdf/constants'
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

const normalizeColumnTitle = (title: string) => title.trim().replace(/\s+/g, ' ').toLowerCase()
const normalizeFieldKey = (value: string) => value.trim().replace(/[_\s-]+/g, '').toLowerCase()
const getDisplayFileName = (name: string | null | undefined): string => (name ?? '').trim().replace(/\.pdf$/i, '')
const isEmptyCellValue = (value: unknown) =>
    value === null || value === undefined || (typeof value === 'string' && (value.trim() === '' || value.trim().toUpperCase() === 'NULL'))

function mergeDuplicateColumnsInTable(
    table: AiPdfTable,
    nextColumns: AiPdfTable['columns'],
    nextMapping: AiPdfLineItemMapping,
): { columns: AiPdfTable['columns']; rows: AiPdfTableRow[]; mapping: AiPdfLineItemMapping } {
    const normalizedTitleToTargetKey = new Map<string, string>()
    const sourceKeyToTargetKey = new Map<string, string>()
    const mergedColumns: AiPdfTable['columns'] = []

    nextColumns.forEach((column) => {
        const normalizedTitle = normalizeColumnTitle(column.title || column.key)
        const existingTargetKey = normalizedTitleToTargetKey.get(normalizedTitle)

        if (existingTargetKey) {
            sourceKeyToTargetKey.set(column.key, existingTargetKey)
            return
        }

        normalizedTitleToTargetKey.set(normalizedTitle, column.key)
        sourceKeyToTargetKey.set(column.key, column.key)
        mergedColumns.push(column)
    })

    const mergedRows = table.rows.map((row) => {
        const mergedRowData: Record<string, unknown> = {}

        mergedColumns.forEach((column) => {
            mergedRowData[column.key] = 'NULL'
        })

        Object.entries(row.rowData).forEach(([sourceKey, value]) => {
            const targetKey = sourceKeyToTargetKey.get(sourceKey)
            if (!targetKey) return

            const existingValue = mergedRowData[targetKey]
            if (isEmptyCellValue(existingValue) && !isEmptyCellValue(value)) {
                mergedRowData[targetKey] = value
            }
        })

        return {
            ...row,
            rowData: mergedRowData,
        }
    })

    const mergedMapping = Object.entries(nextMapping).reduce<AiPdfLineItemMapping>((acc, [sourceKey, mappedField]) => {
        const targetKey = sourceKeyToTargetKey.get(sourceKey)
        if (!targetKey || !mappedField) return acc
        if (!acc[targetKey]) {
            acc[targetKey] = mappedField
        }
        return acc
    }, {})

    return {
        columns: mergedColumns,
        rows: mergedRows,
        mapping: mergedMapping,
    }
}

function mergeTables(tablesToMerge: AiPdfTable[]): AiPdfTable {
    const mergedColumns: { key: string; title: string }[] = []
    const normalizedTitleToKey = new Map<string, string>()
    const mergedTitle = tablesToMerge
        .map((table) => table.title?.trim())
        .filter((title): title is string => Boolean(title))
        .join(' + ')

    tablesToMerge.forEach((table) => {
        table.columns.forEach((col) => {
            const normalizedTitle = normalizeColumnTitle(col.title || col.key)
            if (!normalizedTitleToKey.has(normalizedTitle)) {
                normalizedTitleToKey.set(normalizedTitle, col.key)
                mergedColumns.push({ key: col.key, title: col.title })
            }
        })
    })

    const mergedRows: { rowData: Record<string, unknown> }[] = []

    tablesToMerge.forEach((table) => {
        const keyToNormalizedTitle = new Map(
            table.columns.map((col) => [col.key, normalizeColumnTitle(col.title || col.key)])
        )

        table.rows.forEach((row) => {
            const normalizedRowData: Record<string, unknown> = {}
            mergedColumns.forEach((mergedCol) => {
                normalizedRowData[mergedCol.key] = 'NULL'
            })

            Object.entries(row.rowData).forEach(([sourceKey, value]) => {
                const normalizedTitle = keyToNormalizedTitle.get(sourceKey)
                if (!normalizedTitle) return

                const mergedKey = normalizedTitleToKey.get(normalizedTitle)
                if (!mergedKey) return
                normalizedRowData[mergedKey] = value
            })

            mergedRows.push({ rowData: normalizedRowData })
        })
    })

    return {
        id: `merged-${Date.now()}`,
        title: mergedTitle || 'Table 1',
        columns: mergedColumns,
        lineItemColumnMapping: null,
        rows: mergedRows,
    } as AiPdfTable
}

type FrontendSyncSummary = {
    createdTables: number
    updatedTables: number
    deletedTables: number
    createdRows: number
    updatedRows: number
    deletedRows: number
}



function PdfTableGrid({
    table,
    index,
    isMergedTable,
    shouldOpenUpdateColumns,
    openUpdateColumnsRequest,
    onDelete,
    onRowsChange,
    onUpdateSingleColumnTitle,
    onUpdateColumnMappings,
    onSaveColumnMappings,
    lineItemFields,
}: {
    table: AiPdfTable
    index: number
    isMergedTable: boolean
    shouldOpenUpdateColumns: boolean
    openUpdateColumnsRequest: number
    onDelete: () => void
    onRowsChange: (tableId: string, rows: AiPdfTableRow[]) => void
    onUpdateSingleColumnTitle: (tableId: string, columnKey: string, targetField: string) => void
    onUpdateColumnMappings: (tableId: string, columns: AiPdfTable['columns'], mapping: AiPdfLineItemMapping) => void
    onSaveColumnMappings: (tableId: string, columns: AiPdfTable['columns'], mapping: AiPdfLineItemMapping) => Promise<void> | void
    lineItemFields: AiPdfLineItemFieldOption[]
}) {
    const selectedRowsRef = useRef<number[]>([])
    const hotRef = useRef<HotTableClass>(null)
    const [bulkEditOpen, setBulkEditOpen] = useState(false)
    const [singleColumnEditOpen, setSingleColumnEditOpen] = useState(false)
    const [updateColumnsOpen, setUpdateColumnsOpen] = useState(false)
    const [selectedRows, setSelectedRows] = useState<number[]>([])
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [rules, setRules] = useState([createEmptyRule()])
    const [columnToEdit, setColumnToEdit] = useState('')
    const [targetFieldToEdit, setTargetFieldToEdit] = useState('')
    const [columnMappings, setColumnMappings] = useState<Array<{ sourceColumnKey: string; targetField: string }>>([])
    const lastOpenedUpdateColumnsRequestRef = useRef(0)

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
    const getDefaultTargetField = (column: AiPdfTable['columns'][number]) => {
        const existingMappedField = lineItemMapping[column.key]
        if (existingMappedField) {
            return existingMappedField
        }

        const normalizedColumnTitle = normalizeFieldKey(column.title || column.key)
        const matchedField = lineItemFields.find((field) => {
            const normalizedFieldKey = normalizeFieldKey(field.key)
            const normalizedFieldLabel = normalizeFieldKey(field.label)
            return normalizedColumnTitle === normalizedFieldKey || normalizedColumnTitle === normalizedFieldLabel
        })

        return matchedField?.key || ''
    }

    const resetColumnMappings = () => {
        setColumnMappings(
            table.columns.map((column) => ({
                sourceColumnKey: column.key,
                targetField: getDefaultTargetField(column),
            }))
        )
    }
    const openBulkEditModal = () => {
        resetBulkEditModal()
        setBulkEditOpen(true)
    }
    const openSingleColumnEditModal = () => {
        setColumnToEdit('')
        setTargetFieldToEdit('')
        setSingleColumnEditOpen(true)
    }
    const closeSingleColumnEditModal = () => {
        setSingleColumnEditOpen(false)
        setColumnToEdit('')
        setTargetFieldToEdit('')
    }
    const openUpdateColumnsModal = () => {
        resetColumnMappings()
        setUpdateColumnsOpen(true)
    }
    useEffect(() => {
        if (!shouldOpenUpdateColumns || openUpdateColumnsRequest === 0) return
        if (lastOpenedUpdateColumnsRequestRef.current === openUpdateColumnsRequest) return

        lastOpenedUpdateColumnsRequestRef.current = openUpdateColumnsRequest
        openUpdateColumnsModal()
    }, [shouldOpenUpdateColumns, openUpdateColumnsRequest])
    const closeBulkEditModal = () => {
        setBulkEditOpen(false)
        resetBulkEditModal()
    }

    useEffect(() => {
        if (!columnToEdit) return
        const selectedColumn = table.columns.find((column) => column.key === columnToEdit)
        if (!selectedColumn) return
        setTargetFieldToEdit(getDefaultTargetField(selectedColumn))
    }, [columnToEdit, table.columns])

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

    const updateColumnMapping = (
        rowIndex: number,
        key: 'sourceColumnKey' | 'targetField',
        value: string,
    ) => {
        setColumnMappings((prev) => {
            const next = prev.map((row, index) => {
                if (index !== rowIndex) return row

                if (key === 'sourceColumnKey') {
                    return {
                        sourceColumnKey: value,
                        targetField: value ? row.targetField : '',
                    }
                }

                return { ...row, targetField: value }
            })

            return next
        })
    }

    const buildColumnMappingUpdate = () => {
        const nextMapping = columnMappings.reduce<AiPdfLineItemMapping>((acc, row) => {
            if (row.sourceColumnKey && row.targetField) {
                acc[row.sourceColumnKey] = row.targetField
            }
            return acc
        }, {})

        const labelByFieldKey = new Map(lineItemFields.map((field) => [field.key, field.label]))
        const updatedColumns = table.columns.map((column) => {
            const mappedField = nextMapping[column.key]
            const mappedLabel = mappedField ? labelByFieldKey.get(mappedField) : undefined

            if (!mappedLabel) {
                return column
            }

            return {
                ...column,
                title: mappedLabel,
            }
        })

        return { nextMapping, updatedColumns }
    }

    const applyColumnMappings = () => {
        const { nextMapping, updatedColumns } = buildColumnMappingUpdate()

        onUpdateColumnMappings(table.id, updatedColumns, nextMapping)
        Message.success('Columns updated')
    }

    const saveColumnMappings = async () => {
        const { nextMapping, updatedColumns } = buildColumnMappingUpdate()

        await onSaveColumnMappings(table.id, updatedColumns, nextMapping)
        setUpdateColumnsOpen(false)
    }

    const applySingleColumnUpdate = () => {
        if (!columnToEdit || !targetFieldToEdit) {
            Message.error('Select a table column and DB column')
            return
        }

        onUpdateSingleColumnTitle(table.id, columnToEdit, targetFieldToEdit)
        setColumnToEdit('')
        setTargetFieldToEdit('')
        Message.success('Column updated')
    }

    return (
        <div className={index > 0 ? 'border-t-2 border-slate-200' : undefined}>
            <div className="flex flex-col items-start justify-between gap-1 border-b border-slate-100 bg-slate-50 px-4 py- sm:px-5 lg:flex-row lg:items-center">
                <div className="flex items-center gap-1.5">
                    {!isMergedTable && (
                        <Title level={5} className="mb-0 text-sm font-semibold text-[#1d1f2b]">
                            {table.title || `Table ${index + 1}`}
                        </Title>
                    )}
                </div>

                <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:flex-nowrap">
                    <Tag icon={<TableOutlined />} className="mr-0 rounded-md border-none bg-indigo-50 text-[12px] font-semibold text-indigo-500">
                        {table.rows.length} rows
                    </Tag>

                    {isMergedTable && (
                        <Button variant="icon-button-1" size="small" onClick={openSingleColumnEditModal}>
                            <EditOutlined />
                        </Button>
                    )}

                    {!isMergedTable && (
                        <Button
                            variant="icon-button-2"
                            danger
                            size="medium"
                            icon={<DeleteOutlined />}
                            onClick={() => setDeleteConfirmOpen(true)}
                            title="Delete table"
                        />
                    )}
                </div>
            </div>

            <div className="overflow-x-auto [&_.handsontable]:font-inherit [&_.handsontable]:text-[13px] [&_.handsontable_td]:text-[#3d3f52] [&_.handsontable_th]:bg-slate-50 [&_.handsontable_th]:text-[12px] [&_.handsontable_th]:font-semibold [&_.handsontable_th]:text-[#1d1f2b]">
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

            <Modal open={bulkEditOpen} footer={null} onCancel={closeBulkEditModal} width="min(850px, calc(100vw - 24px))">
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
                            <div key={idx} className="mb-4 grid grid-cols-1 items-end gap-3 md:grid-cols-[220px_minmax(0,1fr)_44px] md:gap-4">
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

                                <div className="flex h-full items-end justify-start md:justify-center">
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

            <Modal open={singleColumnEditOpen} footer={null} onCancel={closeSingleColumnEditModal} width="min(620px, calc(100vw - 24px))">
                <Title level={5} className="mb-5">Update Column</Title>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <Text className="mb-2 block">Table Column</Text>

                        <Select
                            allowClear
                            placeholder="Select table column"
                            value={columnToEdit || undefined}
                            onChange={(value) => setColumnToEdit(value)}
                            options={table.columns.map((column) => ({
                                label: column.title,
                                value: column.key,
                            }))}
                            style={{ width: '100%' }}
                        />

                    </div>
                    <div>
                        <Text className="mb-2 block">LineItems Field</Text>
                        <Select
                            allowClear
                            placeholder="Select LineItems field"
                            value={targetFieldToEdit || undefined}
                            onChange={(value) => setTargetFieldToEdit(value)}
                            options={lineItemFields.map((field) => ({
                                label: field.label,
                                value: field.key,
                            }))}
                            style={{ width: '100%' }}
                        />

                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <Button onClick={closeSingleColumnEditModal}>Cancel</Button>
                    <Button type="primary" onClick={applySingleColumnUpdate}>Update</Button>
                </div>
            </Modal>

            <Modal open={updateColumnsOpen} footer={null} onCancel={() => setUpdateColumnsOpen(false)} width="min(880px, calc(100vw - 24px))">
                <Title level={5} style={{ marginBottom: 16 }}>Update Columns </Title>


                <div className="mb-4 hidden gap-4 px-2 sm:grid sm:grid-cols-2">
                    <Text strong>Table Column</Text>
                    <Text strong>DB Column</Text>
                </div>

                <div className="grid gap-3">
                    {columnMappings.map((mappingRow, rowIndex) => {
                        const selectedSourceColumns = new Set(
                            columnMappings
                                .map((row) => row.sourceColumnKey)
                                .filter((sourceColumnKey) => Boolean(sourceColumnKey) && sourceColumnKey !== mappingRow.sourceColumnKey)
                        )

                        const selectedTargetFields = new Set(
                            columnMappings
                                .map((row) => row.targetField)
                                .filter((targetField) => Boolean(targetField) && targetField !== mappingRow.targetField)
                        )

                        const availableSourceColumns = table.columns.filter(
                            (column) => column.key === mappingRow.sourceColumnKey || !selectedSourceColumns.has(column.key)
                        )

                        const availableFieldOptions = lineItemFields.filter(
                            (field) => field.key === mappingRow.targetField || !selectedTargetFields.has(field.key)
                        )

                        return (
                            <div key={mappingRow.sourceColumnKey || rowIndex} className="grid grid-cols-1 items-center gap-3 sm:grid-cols-2 sm:gap-4">
                                <Select
                                    allowClear
                                    placeholder="Select table column"
                                    value={mappingRow.sourceColumnKey || undefined}
                                    onChange={(value) => updateColumnMapping(rowIndex, 'sourceColumnKey', value)}
                                    options={availableSourceColumns.map((column) => ({
                                        label: column.title,
                                        value: column.key,
                                    }))}
                                    style={{ width: '100%' }}
                                />

                                <Select
                                    allowClear
                                    placeholder="Select LineItems field"
                                    value={mappingRow.targetField || undefined}
                                    onChange={(value) => updateColumnMapping(rowIndex, 'targetField', value)}
                                    options={availableFieldOptions.map((field) => ({ label: field.label, value: field.key }))}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        )
                    })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                    <Button onClick={applyColumnMappings}>
                        Update and Continue
                    </Button>
                    <Button type="primary" onClick={() => { void saveColumnMappings() }}>
                        Update and Save
                    </Button>
                </div>
            </Modal>

            <Modal open={deleteConfirmOpen} footer={null} onCancel={() => setDeleteConfirmOpen(false)} width="min(420px, calc(100vw - 24px))">
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
    const searchParams = useSearchParams()
    const uploadId = params.id as string
    const from = searchParams.get('from')
    const sourceQuoteId = searchParams.get('quoteId')
    const isFromQuote = from === 'quote' && Boolean(sourceQuoteId)
    const backHref = isFromQuote ? `/quote/${sourceQuoteId}` : '/hottables'
    const backLabel = isFromQuote ? 'Back to QuoteFiles' : 'Back to Uploads'

    const { data: upload, isLoading, isError, refetch } = useGetAiPdfUploadDetailQuery(uploadId)
    const lineItemFields = LINE_ITEM_FIELD_OPTIONS
    const [syncUpload, { isLoading: isSyncing }] = useSyncAiPdfUploadMutation()

    const [tables, setTables] = useState<AiPdfTable[]>([])
    const [syncColumnsRequestToken, setSyncColumnsRequestToken] = useState(0)
    const [syncColumnsTargetTableId, setSyncColumnsTargetTableId] = useState<string | null>(null)
    const [lastSyncedPayload, setLastSyncedPayload] = useState('')
    const lastUploadIdRef = useRef<string | null>(null)

    useEffect(() => {
        if (!upload || lastUploadIdRef.current === upload.id) return
        lastUploadIdRef.current = upload.id
        const normalizedTables = upload.tables.map((table) => ({
            ...table,
            lineItemColumnMapping: table.lineItemColumnMapping || {},
        }))
        setTables(normalizedTables)
        setLastSyncedPayload(JSON.stringify(buildSyncPayload(normalizedTables)))
    }, [upload])

    const handleRowsChange = (tableId: string, rows: AiPdfTableRow[]) => {
        setTables((prev) => prev.map((table) => (table.id === tableId ? { ...table, rows } : table)))
    }

    const handleUpdateColumnMappings = (tableId: string, columns: AiPdfTable['columns'], mapping: AiPdfLineItemMapping) => {
        setTables((prev) =>
            prev.map((table) => {
                if (table.id !== tableId) return table

                const merged = mergeDuplicateColumnsInTable(table, columns, mapping)
                return {
                    ...table,
                    columns: merged.columns,
                    rows: merged.rows,
                    lineItemColumnMapping: merged.mapping,
                }
            })
        )
    }

    const handleUpdateSingleColumnTitle = (tableId: string, columnKey: string, targetField: string) => {
        setTables((prev) =>
            prev.map((table) => {
                if (table.id !== tableId) return table

                const selectedField = lineItemFields.find((field) => field.key === targetField)
                if (!selectedField) return table

                const updatedColumns = table.columns.map((column) =>
                    column.key === columnKey ? { ...column, title: selectedField.label } : column
                )

                const nextMapping: AiPdfLineItemMapping = {
                    ...(table.lineItemColumnMapping || {}),
                    [columnKey]: targetField,
                }

                const merged = mergeDuplicateColumnsInTable(
                    table,
                    updatedColumns,
                    nextMapping,
                )

                return {
                    ...table,
                    columns: merged.columns,
                    rows: merged.rows,
                    lineItemColumnMapping: merged.mapping,
                }
            })
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

    const currentPayload = useMemo(() => JSON.stringify(buildSyncPayload(tables)), [tables])
    const hasUnsyncedChanges = currentPayload !== lastSyncedPayload

    const syncTables = async (currentTables: AiPdfTable[]) => {
        try {
            const payload = buildSyncPayload(currentTables)

            await syncUpload({ uploadId, payload }).unwrap()
            Message.success(`Synced successfully. `)

            const refreshed = await refetch()
            if (refreshed.data) {
                const normalizedTables = refreshed.data.tables.map((table) => ({
                    ...table,
                    lineItemColumnMapping: table.lineItemColumnMapping || {},
                }))
                setTables(normalizedTables)
                setLastSyncedPayload(JSON.stringify(buildSyncPayload(normalizedTables)))
            } else {
                setLastSyncedPayload(JSON.stringify(payload))
            }
        } catch (error: unknown) {
            const fallback = 'Failed to sync table changes'
            const err = error as { data?: { message?: string } }
            Message.error(err?.data?.message || fallback)
        }
    }

    const handleSyncChanges = async () => {
        await syncTables(tables)
    }

    const handleSaveColumnMappings = async (
        tableId: string,
        columns: AiPdfTable['columns'],
        mapping: AiPdfLineItemMapping,
    ) => {
        const nextTables = tables.map((table) => {
            if (table.id !== tableId) return table

            const merged = mergeDuplicateColumnsInTable(table, columns, mapping)
            return {
                ...table,
                columns: merged.columns,
                rows: merged.rows,
                lineItemColumnMapping: merged.mapping,
            }
        })

        setTables(nextTables)
        await syncTables(nextTables)
    }

    const handleSyncButtonClick = () => {
        const mergedTable = tables.find((table) => table.id.startsWith('merged-'))
        const singleTable = tables.length === 1 ? tables[0] : null
        const syncColumnsTargetId = mergedTable?.id || singleTable?.id || null

        if (!syncColumnsTargetId) {
            void handleSyncChanges()
            return
        }

        setSyncColumnsTargetTableId(syncColumnsTargetId)
        setSyncColumnsRequestToken((prev) => prev + 1)
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

    const isMergedView = tables.length === 1 && tables[0]?.id.startsWith('merged-')
    const isSyncDisabled = !hasUnsyncedChanges

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f8f9fc] p-4 sm:p-6 lg:p-8">
                <div className="flex min-h-75 items-center justify-center"><Spin size="large" /></div>
            </div>
        )
    }

    if (isError || !upload) {
        return (
            <div className="min-h-screen bg-[#f8f9fc] p-4 sm:p-6 lg:p-8">
                <div className="flex min-h-75 items-center justify-center">
                    <Empty description={<Text className="text-slate-400">Upload not found</Text>} />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#f8f9fc] p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:mb-7 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <Link href={backHref}>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        variant="secondary"
                        style={{ height: 40, padding: '0 14px', borderRadius: 10, fontSize: 14, fontWeight: 600 }}

                    >
                        {backLabel}
                    </Button>
                </Link>

                <div className="flex w-full flex-wrap items-center gap-2.5 sm:w-auto sm:gap-3">
                    <div className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5">
                        <FileTextOutlined className="text-[13px] text-indigo-500" />
                        <Text className="max-w-40 truncate text-[13px] font-medium text-[#1d1f2b] sm:max-w-65">{getDisplayFileName(upload.fileName) || upload.fileName}</Text>
                    </div>

                    {!isMergedView && (
                        <Tag className="rounded-md border-none bg-indigo-50 font-semibold text-indigo-500">
                            {upload.tables.length} {upload.tables.length === 1 ? 'table' : 'tables'}
                        </Tag>
                    )}

                </div>
            </div>

            <Title level={3} className="mb-6 text-[22px] font-bold text-[#1d1f2b]">
                {isMergedView ? 'Table' : 'Tables'}
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
                                isMergedTable={table.id.startsWith('merged-')}
                                shouldOpenUpdateColumns={table.id === syncColumnsTargetTableId}
                                openUpdateColumnsRequest={syncColumnsRequestToken}
                                onDelete={() => handleDeleteTable(table.id)}
                                onRowsChange={handleRowsChange}
                                onUpdateSingleColumnTitle={handleUpdateSingleColumnTitle}
                                onUpdateColumnMappings={handleUpdateColumnMappings}
                                onSaveColumnMappings={handleSaveColumnMappings}
                                lineItemFields={lineItemFields}
                            />
                        ))}
                    </div>

                    <div className="mt-5 flex flex-col justify-end gap-3 sm:flex-row">
                        {tables.length >= 2 && <Button className="w-full sm:w-auto" onClick={handleMergeTables}>Merge Tables</Button>}
                        <Button
                            type="primary"
                            loading={isSyncing}
                            disabled={isSyncDisabled}
                            onClick={handleSyncButtonClick}
                            className={`${isSyncDisabled ? 'blur-[0.6px] opacity-70' : ''} w-full sm:w-auto`}
                        >
                            Sync Changes
                        </Button>
                    </div>
                </>
            )}
        </div>
    )
}