'use client'

<<<<<<< HEAD
import React, { useEffect, useMemo, useRef, useState } from 'react'
=======
import React, { useRef, useState, useMemo } from 'react'
>>>>>>> c318904 (Ui using HOtTables)
import Spin from '@/components/common/Spin'
import Empty from '@/components/common/Empty'
import Tag from '@/components/common/Tag'
import {
    ArrowLeftOutlined,
    FileTextOutlined,
    TableOutlined,
    PlusOutlined,
    DeleteOutlined,
<<<<<<< HEAD
    EditOutlined,
=======
>>>>>>> c318904 (Ui using HOtTables)
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
<<<<<<< HEAD
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
=======
  useGetAiPdfUploadDetailQuery,
} from '@/store/services/aiPdf/apiSlice'
import type { AiPdfTable } from '@/store/services/aiPdf/types'
>>>>>>> c318904 (Ui using HOtTables)
import Modal from '@/components/common/Modal'
import Select from '@/components/common/Select'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import Typography from '@/components/common/Typography'
<<<<<<< HEAD

registerAllModules()
const { Title, Text } = Typography

const createEmptyRule = () => ({
    column: '',
    value: '',
})

const normalizeColumnTitle = (title: string) => title.trim().replace(/\s+/g, ' ').toLowerCase()
const normalizeFieldKey = (value: string) => value.trim().replace(/[_\s-]+/g, '').toLowerCase()
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
=======
import {
  PageWrapper,
  TopBar,
  BackButton,
  MetaRow,
  FileChip,
  PageTitle,
  TablesWrapper,
  TableSection,
  TableHeader,
  TableTitleRow,
  TableTitle,
  TableIndexBadge,
  ActionBar,
  AddButton,
  HotWrapper,
  CenterBox,
  BottomActions,
} from '@/components/hottables/HotTablesDetail.styles'
registerAllModules()

const { Title, Text } = Typography


// ─── Merge utility ─────────────────────────────────────────────────────────
// Combines multiple AiPdfTable objects into one, using exact (case-sensitive)
// column title matching. Columns with the same title across tables are
// unified into a single column; rows are normalized to the merged schema,
// with missing fields set to null.

function mergeTables(tablesToMerge: AiPdfTable[]): AiPdfTable {
    const mergedColumns: { key: string; title: string }[] = []
    const titleToKey = new Map<string, string>()

    tablesToMerge.forEach((table) => {
        table.columns.forEach((col) => {
            if (!titleToKey.has(col.title)) {
                titleToKey.set(col.title, col.key)
>>>>>>> c318904 (Ui using HOtTables)
                mergedColumns.push({ key: col.key, title: col.title })
            }
        })
    })

    const mergedRows: { rowData: Record<string, unknown> }[] = []

    tablesToMerge.forEach((table) => {
<<<<<<< HEAD
        const keyToNormalizedTitle = new Map(
            table.columns.map((col) => [col.key, normalizeColumnTitle(col.title || col.key)])
=======
        const keyToTitle = new Map(
            table.columns.map((col) => [col.key, col.title])
>>>>>>> c318904 (Ui using HOtTables)
        )

        table.rows.forEach((row) => {
            const normalizedRowData: Record<string, unknown> = {}
<<<<<<< HEAD
=======

>>>>>>> c318904 (Ui using HOtTables)
            mergedColumns.forEach((mergedCol) => {
                normalizedRowData[mergedCol.key] = 'NULL'
            })

            Object.entries(row.rowData).forEach(([sourceKey, value]) => {
<<<<<<< HEAD
                const normalizedTitle = keyToNormalizedTitle.get(sourceKey)
                if (!normalizedTitle) return

                const mergedKey = normalizedTitleToKey.get(normalizedTitle)
                if (!mergedKey) return
=======
                const title = keyToTitle.get(sourceKey)
                if (!title) return

                const mergedKey = titleToKey.get(title)
                if (!mergedKey) return

>>>>>>> c318904 (Ui using HOtTables)
                normalizedRowData[mergedKey] = value
            })

            mergedRows.push({ rowData: normalizedRowData })
        })
    })

    return {
        id: `merged-${Date.now()}`,
<<<<<<< HEAD
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


=======
        title: 'Merged Table',
        columns: mergedColumns,
        rows: mergedRows,
    } as AiPdfTable
}
// ─── Single table renderer ────────────────────────────────────────────────────
>>>>>>> c318904 (Ui using HOtTables)

function PdfTableGrid({
    table,
    index,
<<<<<<< HEAD
    isMergedTable,
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
    openUpdateColumnsRequest: number
    onDelete: () => void
    onRowsChange: (tableId: string, rows: AiPdfTableRow[]) => void
    onUpdateSingleColumnTitle: (tableId: string, columnKey: string, targetField: string) => void
    onUpdateColumnMappings: (tableId: string, columns: AiPdfTable['columns'], mapping: AiPdfLineItemMapping) => void
    onSaveColumnMappings: (tableId: string, columns: AiPdfTable['columns'], mapping: AiPdfLineItemMapping) => Promise<void> | void
    lineItemFields: AiPdfLineItemFieldOption[]
=======
    onDelete,
}: {
    table: AiPdfTable
    index: number
    onDelete: () => void
>>>>>>> c318904 (Ui using HOtTables)
}) {
    const selectedRowsRef = useRef<number[]>([])
    const hotRef = useRef<HotTableClass>(null)
    const [bulkEditOpen, setBulkEditOpen] = useState(false)
<<<<<<< HEAD
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
        if (!isMergedTable || openUpdateColumnsRequest === 0) return
        if (lastOpenedUpdateColumnsRequestRef.current === openUpdateColumnsRequest) return

        lastOpenedUpdateColumnsRequestRef.current = openUpdateColumnsRequest
        openUpdateColumnsModal()
    }, [isMergedTable, openUpdateColumnsRequest])
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
=======
    const [selectedRows, setSelectedRows] = useState<number[]>([])
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

    const [rules, setRules] = useState([
        {
            column: '',
            value: '',
        },
    ])

    const colHeaders = useMemo(
        () => table.columns.map((c) => c.title),
        [table.columns]
    )

    const columns = useMemo(
        () => table.columns.map((c) => ({ data: c.key })),
        [table.columns]
    )

    const data = useMemo(
        () => table.rows.map((r) => ({ ...r.rowData })),
        [table.rows]
    )

    const addRow = () => {
        const hot = hotRef.current?.hotInstance
        if (!hot) return
        hot.alter('insert_row_below', hot.countRows())
    }
    const addRule = () => {
        setRules((prev) => [
            ...prev,
            { column: '', value: '' },
        ])
    }

    const removeRule = (index: number) => {
        setRules((prev) =>
            prev.filter((_, i) => i !== index)
        )
    }

    const updateRule = (
        index: number,
        key: 'column' | 'value',
        value: string,
    ) => {
        setRules((prev) =>
            prev.map((rule, i) =>
                i === index
                    ? { ...rule, [key]: value }
                    : rule
            )
        )
>>>>>>> c318904 (Ui using HOtTables)
    }

    const applyBulkEdit = () => {
        const hot = hotRef.current?.hotInstance
<<<<<<< HEAD
=======

>>>>>>> c318904 (Ui using HOtTables)
        if (!hot) return

        selectedRows.forEach((rowIndex) => {
            rules.forEach((rule) => {
                if (!rule.column) return
<<<<<<< HEAD
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
                          <EditOutlined/>
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
=======

                hot.setDataAtRowProp(
                    rowIndex,
                    rule.column,
                    rule.value,
                )
            })
        })

        Message.success(
            `Updated ${selectedRows.length} rows`
        )

        setBulkEditOpen(false)
    }



    return (
        <TableSection>
            <TableHeader>
                <TableTitleRow>
                    <TableIndexBadge>{index + 1}</TableIndexBadge>
                    <TableTitle level={5}>{table.title || `Table ${index + 1}`}</TableTitle>
                </TableTitleRow>

                <ActionBar>
                    <Tag
                        icon={<TableOutlined />}
                        style={{
                            background: '#f0f1ff',
                            color: '#6366f1',
                            border: 'none',
                            borderRadius: 6,
                            fontWeight: 600,
                            fontSize: 12,
                            marginRight: 0,
                        }}
                    >
                        {table.rows.length} rows
                    </Tag>

                    {selectedRows.length > 0 && (
                        <Button
                            type="primary"
                            size="small"
                            onClick={() => setBulkEditOpen(true)}
                        >
                            Edit ({selectedRows.length})
                        </Button>



                    )}
                    <Button
                        variant="icon-button-2"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => setDeleteConfirmOpen(true)}
                        title="Delete table"
                    />


                </ActionBar>
            </TableHeader>

            <HotWrapper>
                {data.length === 0 ? (
                    <CenterBox>
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={<Text style={{ color: '#8b8fa8' }}>No rows in this table</Text>}
                        />
                    </CenterBox>
>>>>>>> c318904 (Ui using HOtTables)
                ) : (
                    <HotTable
                        ref={hotRef}
                        data={data}
                        colHeaders={colHeaders}
                        columns={columns}
<<<<<<< HEAD
                        colWidths={colWidths}
=======
>>>>>>> c318904 (Ui using HOtTables)
                        rowHeaders={true}
                        width="100%"
                        height="auto"
                        autoRowSize={true}
<<<<<<< HEAD
                        autoColumnSize={false}
=======
                        autoColumnSize={true}
>>>>>>> c318904 (Ui using HOtTables)
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
<<<<<<< HEAD
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
=======
                        afterSelectionEnd={(row, _col, row2) => {
                            const rows: number[] = []

                            const start = Math.min(row, row2)
                            const end = Math.max(row, row2)

                            for (let i = start; i <= end; i++) {
                                rows.push(i)
                            }

                            selectedRowsRef.current = rows

                            setSelectedRows((prev) => {
                                if (
                                    prev.length === rows.length &&
                                    prev.every((value, index) => value === rows[index])
                                ) {
                                    return prev
                                }

>>>>>>> c318904 (Ui using HOtTables)
                                return rows
                            })
                        }}
                    />
                )}
<<<<<<< HEAD
            </div>

            <Modal open={bulkEditOpen} footer={null} onCancel={closeBulkEditModal} width="min(850px, calc(100vw - 24px))">
                <Title level={5} className="mb-6">Edit {selectedRows.length} rows</Title>
                <Text className="mb-6 block text-neutral-500">Pick columns, enter a shared value, and apply it to all selected rows.</Text>

                <div className="mb-6">
                    <Button type="primary" icon={<PlusOutlined />} onClick={addRule}>
=======
            </HotWrapper>

            <Modal
                open={bulkEditOpen}
                footer={null}
                onCancel={() => setBulkEditOpen(false)}
                width={850}
            >
                <Title level={5} style={{ marginBottom: 24 }}>
                    Edit {selectedRows.length} rows
                </Title>

                <Text
                    style={{
                        display: 'block',
                        marginBottom: 24,
                        color: '#666',
                    }}
                >
                    Pick columns, enter a shared value, and apply it to all selected rows.
                </Text>

                <div style={{ marginBottom: 24 }}>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={addRule}
                    >
>>>>>>> c318904 (Ui using HOtTables)
                        Add field
                    </Button>
                </div>

                {(() => {
<<<<<<< HEAD
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
=======
                    const selectedColumnKeys = new Set(
                        rules
                            .map((r) => r.column)
                            .filter((c): c is string => Boolean(c))
                    )

                    return rules.map((rule, index) => {
                        const availableColumns = table.columns.filter(
                            (c) => c.key === rule.column || !selectedColumnKeys.has(c.key)
                        )

                        return (
                            <div
                                key={index}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '220px 1fr 40px',
                                    gap: 16,
                                    alignItems: 'start',
                                    marginBottom: 16,
                                }}
                            >
                                <div style={{ width: '100%' }}>
                                    <Text style={{ display: 'block', marginBottom: 8 }}>
                                        Field
                                    </Text>

                                    <Select
                                        placeholder="Select field"
                                        value={rule.column}
                                        onChange={(value) =>
                                            updateRule(index, 'column', value)
                                        }
                                        options={availableColumns.map((c) => ({
                                            label: c.title,
                                            value: c.key,
                                        }))}
                                        style={{ width: '100%' }}
                                    />
                                </div>

                                <div style={{ width: '100%' }}>
                                    <Text style={{ display: 'block', marginBottom: 8 }}>
                                        Value
                                    </Text>

                                    <Input
                                        placeholder="Select a field first"
                                        value={rule.value}
                                        disabled={!rule.column}
                                        onChange={(e) =>
                                            updateRule(index, 'value', e.target.value)
                                        }
                                        style={{ width: '100%' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ height: 22 }} />
                                    <Button
                                        variant="icon-button-2"
                                        icon={<DeleteOutlined />}
                                        onClick={() => removeRule(index)}
                                        style={{ width: 32, height: 32 }}
                                    />
>>>>>>> c318904 (Ui using HOtTables)
                                </div>
                            </div>
                        )
                    })
                })()}

<<<<<<< HEAD
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
=======
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 12,
                        marginTop: 24,
                    }}
                >
                    <Button onClick={() => setBulkEditOpen(false)}>
                        Cancel
                    </Button>

                    <Button
                        type="primary"
                        onClick={applyBulkEdit}
                    >
                        Apply changes
                    </Button>
                </div>
            </Modal>
            <Modal
                open={deleteConfirmOpen}
                footer={null}
                onCancel={() => setDeleteConfirmOpen(false)}
                width={420}
            >
                <Title level={5} style={{ marginBottom: 16 }}>
                    Delete this table?
                </Title>

                <Text style={{ display: 'block', marginBottom: 24, color: '#666' }}>
                    {`"${table.title || `Table ${index + 1}`}" and its ${table.rows.length} row${table.rows.length === 1 ? '' : 's'} will be removed from this view. This won't affect the original PDF.`}
                </Text>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 12,
                    }}
                >
                    <Button onClick={() => setDeleteConfirmOpen(false)}>
                        Cancel
                    </Button>

                    <Button
                        danger
                        type="primary"
                        onClick={() => {
                            setDeleteConfirmOpen(false)
                            onDelete()
                        }}
                    >
>>>>>>> c318904 (Ui using HOtTables)
                        Delete table
                    </Button>
                </div>
            </Modal>
<<<<<<< HEAD
        </div>
    )
}

=======

        </TableSection>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

>>>>>>> c318904 (Ui using HOtTables)
export default function UploadDetailPage() {
    const params = useParams()
    const uploadId = params.id as string

<<<<<<< HEAD
    const { data: upload, isLoading, isError, refetch } = useGetAiPdfUploadDetailQuery(uploadId)
    const lineItemFields = LINE_ITEM_FIELD_OPTIONS
    const [syncUpload, { isLoading: isSyncing }] = useSyncAiPdfUploadMutation()

    const [tables, setTables] = useState<AiPdfTable[]>([])
    const [syncColumnsRequestToken, setSyncColumnsRequestToken] = useState(0)
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

    const initialPayload = useMemo(() => JSON.stringify(buildSyncPayload(upload?.tables || [])), [upload])
    const currentPayload = useMemo(() => JSON.stringify(buildSyncPayload(tables)), [tables])
    const hasUnsyncedChanges = currentPayload !== initialPayload

    const syncTables = async (currentTables: AiPdfTable[]) => {
        try {
            const payload = buildSyncPayload(currentTables)

            await syncUpload({ uploadId, payload }).unwrap()
            Message.success(`Synced successfully. `)

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

        if (!mergedTable) {
            void handleSyncChanges()
            return
        }

        setSyncColumnsRequestToken((prev) => prev + 1)
=======
    const { data: upload, isLoading, isError } = useGetAiPdfUploadDetailQuery(uploadId)

    const [tables, setTables] = useState<AiPdfTable[]>([])
    const lastUploadIdRef = useRef<string | null>(null)

    if (upload && lastUploadIdRef.current !== upload.id) {
        lastUploadIdRef.current = upload.id
        setTables(upload.tables)
>>>>>>> c318904 (Ui using HOtTables)
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
<<<<<<< HEAD
        Message.success(`Merged ${tables.length} tables into one (${merged.columns.length} columns, ${merged.rows.length} rows)`)
    }

    const isMergedView = tables.length === 1 && tables[0]?.id.startsWith('merged-')

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f8f9fc] p-4 sm:p-6 lg:p-8">
                <div className="flex min-h-75 items-center justify-center"><Spin size="large" /></div>
            </div>
=======
        Message.success(
            `Merged ${tables.length} tables into one (${merged.columns.length} columns, ${merged.rows.length} rows)`
        )
    }

    if (isLoading) {
        return (
            <PageWrapper>
                <CenterBox><Spin size="large" /></CenterBox>
            </PageWrapper>
>>>>>>> c318904 (Ui using HOtTables)
        )
    }

    if (isError || !upload) {
        return (
<<<<<<< HEAD
            <div className="min-h-screen bg-[#f8f9fc] p-4 sm:p-6 lg:p-8">
                <div className="flex min-h-75 items-center justify-center">
                    <Empty description={<Text className="text-slate-400">Upload not found</Text>} />
                </div>
            </div>
=======
            <PageWrapper>
                <CenterBox>
                    <Empty description={<Text style={{ color: '#8b8fa8' }}>Upload not found</Text>} />
                </CenterBox>
            </PageWrapper>
>>>>>>> c318904 (Ui using HOtTables)
        )
    }

    return (
<<<<<<< HEAD
        <div className="min-h-screen bg-[#f8f9fc] p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:mb-7 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <Link href="/hottables">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        className="h-9 rounded-lg border border-slate-200 px-3 text-[13px] font-medium text-[#1d1f2b] hover:border-indigo-500! hover:text-indigo-500!"
                    >
                        Back to PDFs
                    </Button>
                </Link>

                <div className="flex w-full flex-wrap items-center gap-2.5 sm:w-auto sm:gap-3">
                    <div className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5">
                        <FileTextOutlined className="text-[13px] text-indigo-500" />
                        <Text className="max-w-40 truncate text-[13px] font-medium text-[#1d1f2b] sm:max-w-65">{upload.fileName}</Text>
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
=======
        <PageWrapper>
            <TopBar>
                <Link href="/hottables">
                    <BackButton icon={<ArrowLeftOutlined />}>
                        Back to PDFs
                    </BackButton>
                </Link>

                <MetaRow>
                    <FileChip>
                        <FileTextOutlined
                            style={{ color: '#6366f1', fontSize: 13 }}
                        />
                        <Text
                            style={{
                                fontSize: 13,
                                fontWeight: 500,
                                color: '#1d1f2b',
                            }}
                        >
                            {upload.fileName}
                        </Text>
                    </FileChip>

                    <Tag
                        style={{
                            background: '#f0f1ff',
                            color: '#6366f1',
                            border: 'none',
                            borderRadius: 6,
                            fontWeight: 600,
                        }}
                    >
                        {upload.tables.length}{' '}
                        {upload.tables.length === 1 ? 'table' : 'tables'}
                    </Tag>
                </MetaRow>
            </TopBar>

            <PageTitle level={3}>Extracted Tables</PageTitle>
>>>>>>> c318904 (Ui using HOtTables)

            {upload.tables.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
<<<<<<< HEAD
                    description={<Text className="text-slate-400">No tables found in this upload</Text>}
                />
            ) : (
                <>
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
=======
                    description={
                        <Text style={{ color: '#8b8fa8' }}>
                            No tables found in this upload
                        </Text>
                    }
                />
            ) : (
                <>
                    <TablesWrapper>
>>>>>>> c318904 (Ui using HOtTables)
                        {tables.map((table, index) => (
                            <PdfTableGrid
                                key={table.id}
                                table={table}
                                index={index}
<<<<<<< HEAD
                                isMergedTable={table.id.startsWith('merged-')}
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
                            disabled={!hasUnsyncedChanges}
                            onClick={handleSyncButtonClick}
                            className={`${!hasUnsyncedChanges ? 'blur-[0.6px] opacity-70' : ''} w-full sm:w-auto`}
                        >
                            Sync Changes
                        </Button>
                    </div>
                </>
            )}
        </div>
=======
                                onDelete={() => handleDeleteTable(table.id)}
                            />
                        ))}
                    </TablesWrapper>

                    <BottomActions>
                        {tables.length >= 2 && (
                            <Button onClick={handleMergeTables}>
                                Merge Tables
                            </Button>
                        )}

                        <Button
                            type="primary"
                            onClick={() => {
                                Message.success(
                                    'Sync functionality will be connected later'
                                )
                            }}
                        >
                            Sync Changes
                        </Button>
                    </BottomActions>
                </>
            )}
        </PageWrapper>
>>>>>>> c318904 (Ui using HOtTables)
    )
}
