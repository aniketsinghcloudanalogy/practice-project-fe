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
import { useParams, useRouter, useSearchParams } from 'next/navigation'
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

const MANUAL_COLUMN_LABELS = Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index))
const MANUAL_DEFAULT_ROWS = 15
const MANUAL_MIN_HEADERS = 5

const createManualTable = (uploadId: string): AiPdfTable => {
    const tableId = `manual-${uploadId}`
    const columns = MANUAL_COLUMN_LABELS.map((label) => ({
        key: `col_${label}`,
        title: label,
        dataType: 'text',
    }))

    const rows = Array.from({ length: MANUAL_DEFAULT_ROWS }, (_, rowIndex) => {
        const rowData = columns.reduce<Record<string, unknown>>((acc, column) => {
            acc[column.key] = ''
            return acc
        }, {})

        return {
            id: '',
            pdfTableId: tableId,
            rowData,
            rowIndex,
            isDeleted: false,
            createdAt: '',
            updatedAt: '',
        }
    })

    return {
        id: tableId,
        pdfUploadId: uploadId,
        userId: '',
        title: 'Manual Table',
        columns,
        lineItemColumnMapping: {},
        isDeleted: false,
        createdAt: '',
        updatedAt: '',
        rows,
    }
}

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
            mergedRowData[column.key] = ''
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
                normalizedRowData[mergedCol.key] = ''
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
        title: '',
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
    showSyncColumnHeaders,
    shouldOpenUpdateColumns,
    openUpdateColumnsRequest,
    onDelete,
    onRowsChange,
    onColumnsAndRowsChange,
    onSyncColumnHeaders,
    onUpdateSingleColumnTitle,
    onUpdateColumnMappings,
    onSaveColumnMappings,
    lineItemFields,
}: {
    table: AiPdfTable
    index: number
    isMergedTable: boolean
    showSyncColumnHeaders: boolean
    shouldOpenUpdateColumns: boolean
    openUpdateColumnsRequest: number
    onDelete: () => void
    onRowsChange: (tableId: string, rows: AiPdfTableRow[]) => void
    onColumnsAndRowsChange: (tableId: string, columns: AiPdfTable['columns'], rows: AiPdfTableRow[]) => void
    onSyncColumnHeaders: (tableId: string) => void
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
    const [renameColumnOpen, setRenameColumnOpen] = useState(false)
    const [isSavingColumnMappings, setIsSavingColumnMappings] = useState(false)
    const [selectedRows, setSelectedRows] = useState<number[]>([])
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [rules, setRules] = useState([createEmptyRule()])
    const [columnToEdit, setColumnToEdit] = useState('')
    const [targetFieldToEdit, setTargetFieldToEdit] = useState('')
    const [columnKeyToRename, setColumnKeyToRename] = useState('')
    const [columnTitleToRename, setColumnTitleToRename] = useState('')
    const [columnMappings, setColumnMappings] = useState<Array<{ sourceColumnKey: string; targetField: string }>>([])
    const lastOpenedUpdateColumnsRequestRef = useRef(0)

    const colHeaders = useMemo(() => table.columns.map((c) => c.title), [table.columns])
    const columns = useMemo(() => table.columns.map((c) => ({ data: c.key })), [table.columns])
    const colWidths = useMemo(() => table.columns.map(() => 180), [table.columns])
    const data = useMemo(() => table.rows.map((r) => ({ __rowId: r.id, ...r.rowData })), [table.rows])
    const lineItemMapping = table.lineItemColumnMapping || {}

    const getNextManualColumnKey = (existingColumns: AiPdfTable['columns']) => {
        const existingKeys = new Set(existingColumns.map((column) => column.key))

        for (const label of MANUAL_COLUMN_LABELS) {
            const candidate = `col_${label}`
            if (!existingKeys.has(candidate)) {
                return candidate
            }
        }

        let suffix = existingColumns.length + 1
        while (existingKeys.has(`col_${suffix}`)) {
            suffix += 1
        }
        return `col_${suffix}`
    }

    const insertColumnsAt = (startIndex: number, amount: number) => {
        if (!showSyncColumnHeaders || amount <= 0) return

        const nextColumns = [...table.columns]
        const insertedColumns: AiPdfTable['columns'] = []

        for (let i = 0; i < amount; i += 1) {
            const key = getNextManualColumnKey(nextColumns)
            insertedColumns.push({
                key,
                title: key.replace(/^col_/, ''),
                dataType: 'text',
            })
            nextColumns.splice(startIndex + i, 0, insertedColumns[i])
        }

        const nextRows = table.rows.map((row) => {
            const nextRowData = { ...row.rowData }
            insertedColumns.forEach((column) => {
                nextRowData[column.key] = ''
            })

            return {
                ...row,
                rowData: nextRowData,
            }
        })

        onColumnsAndRowsChange(table.id, nextColumns, nextRows)
        Message.success(`Inserted ${amount} column${amount > 1 ? 's' : ''}`)
    }

    const removeColumnsAt = (startIndex: number, amount: number) => {
        if (!showSyncColumnHeaders || amount <= 0) return
        if (table.columns.length <= amount) {
            Message.error('At least one column is required')
            return
        }

        const removedKeys = table.columns
            .slice(startIndex, startIndex + amount)
            .map((column) => column.key)

        const nextColumns = table.columns.filter((_, index) => index < startIndex || index >= startIndex + amount)
        const nextRows = table.rows.map((row) => {
            const nextRowData = { ...row.rowData }
            removedKeys.forEach((key) => {
                delete nextRowData[key]
            })

            return {
                ...row,
                rowData: nextRowData,
            }
        })

        onColumnsAndRowsChange(table.id, nextColumns, nextRows)
        Message.success(`Removed ${amount} column${amount > 1 ? 's' : ''}`)
    }

    const openRenameColumnModal = (columnIndex: number) => {
        if (!showSyncColumnHeaders) return

        const targetColumn = table.columns[columnIndex]
        if (!targetColumn) {
            Message.error('Select a valid column to rename')
            return
        }

        setColumnKeyToRename(targetColumn.key)
        setColumnTitleToRename(targetColumn.title)
        setRenameColumnOpen(true)
    }

    const closeRenameColumnModal = () => {
        setRenameColumnOpen(false)
        setColumnKeyToRename('')
        setColumnTitleToRename('')
    }

    const applyRenameColumn = () => {
        const nextTitle = columnTitleToRename.trim()
        if (!columnKeyToRename || !nextTitle) {
            Message.error('Enter a column name')
            return
        }

        const updatedColumns = table.columns.map((column) =>
            column.key === columnKeyToRename ? { ...column, title: nextTitle } : column
        )

        onUpdateColumnMappings(table.id, updatedColumns, lineItemMapping)
        closeRenameColumnModal()
        Message.success('Column renamed')
    }

    const manualContextMenu = useMemo(() => {
        if (!showSyncColumnHeaders) return true

        return {
            items: {
                row_above: {},
                row_below: {},
                remove_row: {},
                hsep1: { name: '---------' },
                insert_column_left: {
                    name: 'Insert column left',
                    callback: (_key: string, selection: Array<{ start: { col: number } }>) => {
                        const selectedCol = selection?.[0]?.start?.col ?? table.columns.length
                        insertColumnsAt(Math.max(0, selectedCol), 1)
                    },
                },
                insert_column_right: {
                    name: 'Insert column right',
                    callback: (_key: string, selection: Array<{ start: { col: number } }>) => {
                        const selectedCol = selection?.[0]?.start?.col ?? (table.columns.length - 1)
                        insertColumnsAt(Math.max(0, selectedCol + 1), 1)
                    },
                },
                remove_manual_column: {
                    name: 'Remove column',
                    callback: (_key: string, selection: Array<{ start: { col: number }; end: { col: number } }>) => {
                        const startCol = Math.max(0, selection?.[0]?.start?.col ?? 0)
                        const endCol = Math.max(startCol, selection?.[0]?.end?.col ?? startCol)
                        removeColumnsAt(startCol, (endCol - startCol) + 1)
                    },
                    disabled: () => table.columns.length <= 1,
                },
                rename_manual_column: {
                    name: 'Rename column',
                    callback: (_key: string, selection: Array<{ start: { col: number } }>) => {
                        const selectedCol = Math.max(0, selection?.[0]?.start?.col ?? 0)
                        openRenameColumnModal(selectedCol)
                    },
                    disabled: () => table.columns.length === 0,
                },
                hsep2: { name: '---------' },
                undo: {},
                redo: {},
                make_read_only: {},
                alignment: {},
                copy: {},
                cut: {},
            },
        }
    }, [showSyncColumnHeaders, table.columns, table.rows])

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

        setIsSavingColumnMappings(true)

        try {
            await onSaveColumnMappings(table.id, updatedColumns, nextMapping)
            setUpdateColumnsOpen(false)
        } finally {
            setIsSavingColumnMappings(false)
        }
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

    const canDeleteTable = !isMergedTable && !showSyncColumnHeaders && Object.keys(lineItemMapping).length === 0

    return (
        <div className={index > 0 ? 'border-t-2 border-slate-200' : undefined}>
            <div className="flex flex-col items-center justify-end gap-1 border-b border-slate-100 bg-slate-50 px-4 py- sm:px-5 lg:flex-row lg:items-center">
                <div className="flex flex-wrap items-center justify-end gap-2 lg:flex-nowrap">
                    {showSyncColumnHeaders && (
                        <Button size="small" onClick={() => onSyncColumnHeaders(table.id)}>
                            Sync Column Headers
                        </Button>
                    )}

                    <Tag icon={<TableOutlined />} className="mr-0 rounded-md border-none bg-indigo-50 text-[12px] font-semibold text-indigo-500">
                        {table.rows.length} rows
                    </Tag>

                    {isMergedTable && (
                        <Button variant="icon-button-1" size="small" onClick={openSingleColumnEditModal}>
                            <EditOutlined />
                        </Button>
                    )}

                    {canDeleteTable && (
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
                        contextMenu={manualContextMenu}
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
                    <Button onClick={applyColumnMappings} disabled={isSavingColumnMappings}>
                        Update and Continue
                    </Button>
                    <Button type="primary" loading={isSavingColumnMappings} disabled={isSavingColumnMappings} onClick={() => { void saveColumnMappings() }}>
                        Update and Save
                    </Button>
                </div>
            </Modal>

            <Modal open={renameColumnOpen} footer={null} onCancel={closeRenameColumnModal} width="min(520px, calc(100vw - 24px))">
                <Title level={5} className="mb-4">Rename Column</Title>
                <Text className="mb-3 block text-neutral-500">Set a new header name for this manual column.</Text>

                <Input
                    placeholder="Enter column header"
                    value={columnTitleToRename}
                    onChange={(e) => setColumnTitleToRename(e.target.value)}
                    onPressEnter={applyRenameColumn}
                />

                <div className="mt-6 flex justify-end gap-3">
                    <Button onClick={closeRenameColumnModal}>Cancel</Button>
                    <Button type="primary" onClick={applyRenameColumn}>Rename</Button>
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
    const router = useRouter()
    const params = useParams()
    const searchParams = useSearchParams()
    const uploadId = params.id as string
    const mode = searchParams.get('mode')
    const isManualMode = mode === 'manual'
    const from = searchParams.get('from')
    const sourceQuoteId = searchParams.get('quoteId')
    const isFromQuote = from === 'quote' && Boolean(sourceQuoteId)
    const backHref = isFromQuote ? `/quote/${sourceQuoteId}` : '/hottables'
    const backLabel = isFromQuote ? 'Back to QuoteFiles' : 'Back to Uploads'

    const { data: upload, isLoading, isError, refetch } = useGetAiPdfUploadDetailQuery(uploadId, {
        skip: isManualMode || !uploadId,
    })
    const lineItemFields = LINE_ITEM_FIELD_OPTIONS
    const [syncUpload, { isLoading: isSyncing }] = useSyncAiPdfUploadMutation()

    const [tables, setTables] = useState<AiPdfTable[]>([])
    const [hasManualHeadersSynced, setHasManualHeadersSynced] = useState(false)
    const [syncColumnsRequestToken, setSyncColumnsRequestToken] = useState(0)
    const [syncColumnsTargetTableId, setSyncColumnsTargetTableId] = useState<string | null>(null)
    const [lastSyncedPayload, setLastSyncedPayload] = useState('')
    const [hasEditMappingCompleted, setHasEditMappingCompleted] = useState(false)
    const lastUploadIdRef = useRef<string | null>(null)

    useEffect(() => {
        if (isManualMode) {
            const manualTable = createManualTable(uploadId)
            setTables([manualTable])
            setHasManualHeadersSynced(false)
            setLastSyncedPayload(JSON.stringify(buildSyncPayload([manualTable])))
            lastUploadIdRef.current = manualTable.id
            return
        }

        if (!upload || lastUploadIdRef.current === upload.id) return
        lastUploadIdRef.current = upload.id
        const normalizedTables = upload.tables.map((table) => ({
            ...table,
            lineItemColumnMapping: table.lineItemColumnMapping || {},
        }))
        setTables(normalizedTables)
        setLastSyncedPayload(JSON.stringify(buildSyncPayload(normalizedTables)))
        // Reset mapping completion flag when data loads in edit existing mode
        if (isFromQuote) {
            setHasEditMappingCompleted(false)
        }
    }, [isManualMode, upload, uploadId])

    const handleRowsChange = (tableId: string, rows: AiPdfTableRow[]) => {
        setTables((prev) => prev.map((table) => (table.id === tableId ? { ...table, rows } : table)))
    }

    const handleColumnsAndRowsChange = (tableId: string, columns: AiPdfTable['columns'], rows: AiPdfTableRow[]) => {
        setTables((prev) => prev.map((table) => (table.id === tableId ? { ...table, columns, rows } : table)))
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
            ...(table.id && !table.id.startsWith('merged-') && !table.id.startsWith('manual-') ? { id: table.id } : {}),
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

            // Mark edit mapping as completed after successful sync
            if (isFromQuote && !isManualMode) {
                setHasEditMappingCompleted(true)
            }

            if (isManualMode) {
                setLastSyncedPayload(JSON.stringify(payload))
                if (isFromQuote && sourceQuoteId) {
                    router.push(`/quote/${sourceQuoteId}`)
                }
                return
            }

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

    const handleSyncColumnHeaders = (tableId: string) => {
        if (!isManualMode) return

        const targetTable = tables.find((table) => table.id === tableId)
        if (!targetTable || targetTable.rows.length === 0) {
            Message.error('Add at least one row before syncing headers')
            return
        }

        const headerRow = targetTable.rows[0]
        const selectedColumns = targetTable.columns
            .map((column) => ({
                column,
                headerValue: String(headerRow.rowData[column.key] ?? '').trim(),
            }))
            .filter(({ headerValue }) => headerValue.length > 0)
            .map(({ column, headerValue }) => ({
                ...column,
                title: headerValue,
                dataType: column.dataType || 'text',
            }))

        if (selectedColumns.length < MANUAL_MIN_HEADERS) {
            Message.error(`At least ${MANUAL_MIN_HEADERS} column headers are required in manual mode`)
            return
        }

        const nextRows = targetTable.rows.slice(1).map((row, rowIndex) => {
            const nextRowData = selectedColumns.reduce<Record<string, unknown>>((acc, column) => {
                acc[column.key] = row.rowData[column.key] ?? ''
                return acc
            }, {})

            return {
                ...row,
                rowData: nextRowData,
                rowIndex,
            }
        })

        const nextTables = tables.map((table) =>
            table.id === tableId
                ? {
                    ...table,
                    columns: selectedColumns,
                    rows: nextRows,
                    lineItemColumnMapping: {},
                }
                : table
        )

        setTables(nextTables)
        setHasManualHeadersSynced(true)
        Message.success('Column headers synced')
    }

    const validateManualSyncState = (currentTables: AiPdfTable[]) => {
        if (!hasManualHeadersSynced) {
            Message.error('Sync column headers before syncing changes')
            return false
        }

        const totalHeaders = currentTables.reduce((count, table) => (
            count + table.columns.filter((column) => column.title.trim().length > 0).length
        ), 0)

        if (totalHeaders < MANUAL_MIN_HEADERS) {
            Message.error(`At least ${MANUAL_MIN_HEADERS} column headers are required in manual mode`)
            return false
        }

        const hasAtLeastOneHeader = totalHeaders > 0

        if (!hasAtLeastOneHeader) {
            Message.error('Please sync at least one non-empty column header before syncing changes')
            return false
        }

        const hasAtLeastOneDataRow = currentTables.some((table) =>
            table.rows.some((row) =>
                Object.values(row.rowData).some((value) => !isEmptyCellValue(value))
            )
        )

        if (!hasAtLeastOneDataRow) {
            Message.error('Please add at least one data row with values before syncing changes')
            return false
        }

        return true
    }

    const handleSyncChanges = async () => {
        if (isManualMode && !validateManualSyncState(tables)) {
            return
        }

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

        if (isManualMode && !validateManualSyncState(nextTables)) {
            return
        }

        setTables(nextTables)
        await syncTables(nextTables)
    }

    const handleSyncButtonClick = () => {
        if (isSyncing) {
            return
        }

        if (isManualMode && !hasUnsyncedChanges) {
            return
        }

        if (!isManualMode && !isFromQuote && !hasUnsyncedChanges) {
            return
        }

        if (isManualMode) {
            if (!validateManualSyncState(tables)) {
                return
            }

            const manualTableId = tables[0]?.id || null
            if (!manualTableId) {
                Message.error('No table found for column mapping')
                return
            }

            setSyncColumnsTargetTableId(manualTableId)
            setSyncColumnsRequestToken((prev) => prev + 1)
            return
        }

        const mergedTable = tables.find((table) => table.id.startsWith('merged-'))
        let syncColumnsTargetId = mergedTable?.id || null

        if (!syncColumnsTargetId && tables.length > 0) {
                  syncColumnsTargetId = tables[0].id
        }

        if (!syncColumnsTargetId) {
            Message.error('No table found for column mapping')
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
    
    // In edit existing mode from quote, button should be enabled until first mapping is completed
    // In manual mode, button enabled if there are unsaved changes
    const isSyncDisabled = isSyncing || (isManualMode ? !hasUnsyncedChanges : isFromQuote && hasEditMappingCompleted)
    const fileTagCount = isManualMode ? tables.length : upload?.tables.length ?? 0

    if (!isManualMode && isLoading) {
        return (
            <div className="min-h-screen bg-[#f8f9fc] p-4 sm:p-6 lg:p-8">
                <div className="flex min-h-75 items-center justify-center"><Spin size="large" /></div>
            </div>
        )
    }

    if (!isManualMode && (isError || !upload)) {
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
                        <Text className="max-w-40 truncate text-[13px] font-medium text-[#1d1f2b] sm:max-w-65">
                            {isManualMode ? 'Manual Update Table' : getDisplayFileName(upload?.fileName) || upload?.fileName}
                        </Text>
                    </div>

                    {!isMergedView && (
                        <Tag className="rounded-md border-none bg-indigo-50 font-semibold text-indigo-500">
                            {fileTagCount} {fileTagCount === 1 ? 'table' : 'tables'}
                        </Tag>
                    )}

                </div>
            </div>

            <Title level={3} className="mb-6 text-[22px] font-bold text-[#1d1f2b]">
                {isMergedView ? 'Table' : 'Tables'}
            </Title>

            {tables.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={<Text className="text-slate-400">No tables found in this upload</Text>}
                />
            ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    {tables.map((table, index) => (
                        <PdfTableGrid
                            key={table.id}
                            table={table}
                            index={index}
                            isMergedTable={table.id.startsWith('merged-')}
                            showSyncColumnHeaders={isManualMode}
                            shouldOpenUpdateColumns={table.id === syncColumnsTargetTableId}
                            openUpdateColumnsRequest={syncColumnsRequestToken}
                            onDelete={() => handleDeleteTable(table.id)}
                            onRowsChange={handleRowsChange}
                            onColumnsAndRowsChange={handleColumnsAndRowsChange}
                            onSyncColumnHeaders={handleSyncColumnHeaders}
                            onUpdateSingleColumnTitle={handleUpdateSingleColumnTitle}
                            onUpdateColumnMappings={handleUpdateColumnMappings}
                            onSaveColumnMappings={handleSaveColumnMappings}
                            lineItemFields={lineItemFields}
                        />
                    ))}
                </div>
            )}

            <div className="mt-5 flex flex-col justify-end gap-3 sm:flex-row">
                {!isManualMode && tables.length >= 2 && <Button className="w-full sm:w-auto" onClick={handleMergeTables}>Merge Tables</Button>}
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
        </div>
    )
}