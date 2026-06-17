'use client'

import React, { useRef, useState, useMemo } from 'react'
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
} from '@/store/services/aiPdf/apiSlice'
import type { AiPdfTable } from '@/store/services/aiPdf/types'
import Modal from '@/components/common/Modal'
import Select from '@/components/common/Select'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import Typography from '@/components/common/Typography'
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
                mergedColumns.push({ key: col.key, title: col.title })
            }
        })
    })

    const mergedRows: { rowData: Record<string, unknown> }[] = []

    tablesToMerge.forEach((table) => {
        const keyToTitle = new Map(
            table.columns.map((col) => [col.key, col.title])
        )

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
        rows: mergedRows,
    } as AiPdfTable
}
// ─── Single table renderer ────────────────────────────────────────────────────

function PdfTableGrid({
    table,
    index,
    onDelete,
}: {
    table: AiPdfTable
    index: number
    onDelete: () => void
}) {
    const selectedRowsRef = useRef<number[]>([])
    const hotRef = useRef<HotTableClass>(null)
    const [bulkEditOpen, setBulkEditOpen] = useState(false)
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
    }

    const applyBulkEdit = () => {
        const hot = hotRef.current?.hotInstance

        if (!hot) return

        selectedRows.forEach((rowIndex) => {
            rules.forEach((rule) => {
                if (!rule.column) return

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
                ) : (
                    <HotTable
                        ref={hotRef}
                        data={data}
                        colHeaders={colHeaders}
                        columns={columns}
                        rowHeaders={true}
                        width="100%"
                        height="auto"
                        autoRowSize={true}
                        autoColumnSize={true}
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

                                return rows
                            })
                        }}
                    />
                )}
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
                        Add field
                    </Button>
                </div>

                {(() => {
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
                                </div>
                            </div>
                        )
                    })
                })()}

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
                        Delete table
                    </Button>
                </div>
            </Modal>

        </TableSection>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UploadDetailPage() {
    const params = useParams()
    const uploadId = params.id as string

    const { data: upload, isLoading, isError } = useGetAiPdfUploadDetailQuery(uploadId)

    const [tables, setTables] = useState<AiPdfTable[]>([])
    const lastUploadIdRef = useRef<string | null>(null)

    if (upload && lastUploadIdRef.current !== upload.id) {
        lastUploadIdRef.current = upload.id
        setTables(upload.tables)
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
        Message.success(
            `Merged ${tables.length} tables into one (${merged.columns.length} columns, ${merged.rows.length} rows)`
        )
    }

    if (isLoading) {
        return (
            <PageWrapper>
                <CenterBox><Spin size="large" /></CenterBox>
            </PageWrapper>
        )
    }

    if (isError || !upload) {
        return (
            <PageWrapper>
                <CenterBox>
                    <Empty description={<Text style={{ color: '#8b8fa8' }}>Upload not found</Text>} />
                </CenterBox>
            </PageWrapper>
        )
    }

    return (
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

            {upload.tables.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        <Text style={{ color: '#8b8fa8' }}>
                            No tables found in this upload
                        </Text>
                    }
                />
            ) : (
                <>
                    <TablesWrapper>
                        {tables.map((table, index) => (
                            <PdfTableGrid
                                key={table.id}
                                table={table}
                                index={index}
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
    )
}
