"use client";

import React, { useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Button from '@/components/common/Button'
import Message from '@/components/common/Message'
import Modal from '@/components/common/Modal'
import Table from '@/components/common/Table'
import Collapse from '@/components/common/Collapse'
import type { ColumnsType } from '@/components/common/Table/types'
import { QuoteFilesCollapseGlobalStyle } from '@/components/quote/QuoteDetails.styles'
import { useGetQuoteDetailQuery, useVerifyQuoteFileMutation } from '@/store/services/quote/apiSlice'
import type { QuoteExtractedTable, QuoteFile } from '@/store/services/quote/types'
import { ArrowLeftOutlined, CheckOutlined, CloseOutlined } from '@/components/common/antd/icons'

// ─── helpers ────────────────────────────────────────────────────────────────

const formatCellValue = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return '-'
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
        return String(value)
    return JSON.stringify(value)
}


const getColumnNames = (table: QuoteExtractedTable): string[] => {
    const seen = new Set<string>()
    const names: string[] = []

    for (const col of table.columns ?? []) {
        const name = typeof col === 'string' ? col.trim()
            : typeof (col as Record<string, unknown>).key === 'string' ? ((col as Record<string, unknown>).key as string).trim()
                : null
        if (name && !seen.has(name.toLowerCase())) {
            seen.add(name.toLowerCase())
            names.push(name)
        }
    }

    return names
}

const getTableRows = (table: QuoteExtractedTable) =>
    (table.rows ?? []).map((row, i) => ({
            id: row.id || `${table.id}-row-${i}`,
            ...(typeof row.rowData === 'object' && row.rowData !== null ? row.rowData : {}),
        }))

const getRenderableTables = (file: QuoteFile) =>
    (file.tables ?? [])
        .map((table, index) => ({
            id: table.id || `${file.id}-table-${index}`,
            title: table.title?.trim() || `Table ${index + 1}`,
            columns: getColumnNames(table),
            rows: getTableRows(table),
        }))
        .filter((table) => table.columns.length > 0 || table.rows.length > 0)

// ─── component ──────────────────────────────────────────────────────────────

const QuoteDetailsPage = () => {
    const router = useRouter()
    const params = useParams<{ id: string }>()
    const quoteId = params?.id
    const [activeTab, setActiveTab] = React.useState<'review' | 'profitability'>('review')
    const [pendingVerification, setPendingVerification] = React.useState<Pick<QuoteFile, 'id' | 'file_name'> | null>(null)
    const [messageApi, contextHolder] = Message.useMessage()

    const { data, isLoading, isFetching, error } = useGetQuoteDetailQuery(
        quoteId ?? '',
        { skip: !quoteId },
    )
    const [verifyQuoteFile, { isLoading: isVerifying }] = useVerifyQuoteFileMutation()

    React.useEffect(() => {
        if (error) messageApi.error('Failed to load quote details')
    }, [error, messageApi])

    const closeVerificationModal = () => {
        if (isVerifying) {
            return
        }

        setPendingVerification(null)
    }

    const handleConfirmVerification = async () => {
        if (!quoteId || !pendingVerification) {
            return
        }

        try {
            await verifyQuoteFile({ quoteId, quoteFileId: pendingVerification.id }).unwrap()
            messageApi.success('Quote file verified successfully')
            setPendingVerification(null)
        } catch {
            messageApi.error('Failed to verify quote file')
        }
    }

    const files = useMemo(() => data?.files ?? [], [data?.files])
    const loading = isLoading || isFetching
    const reviewFiles = useMemo(
        () => files.filter((file) => !Boolean(file.is_Verifed ?? file.isVerified)),
        [files],
    )
    const profitabilityFiles = useMemo(
        () => files.filter((file) => Boolean(file.is_Verifed ?? file.isVerified)),
        [files],
    )
    const visibleFiles = activeTab === 'review' ? reviewFiles : profitabilityFiles

    // Use backend-computed count — no re-derivation needed
    const lineItemCount = data?.counts.lineItemCount ?? 0

    const collapseItems = useMemo(() => visibleFiles.map((file: QuoteFile) => {
        const renderableTables = getRenderableTables(file)
        const fileLineItemCount = file.lineItems?.length ?? 0
        return {
            key: file.id,
            label: (
                <div className="quote-file-header grid w-full grid-cols-1 items-start gap-1.5 px-3 py-3 text-white sm:grid-cols-[minmax(0,1fr)_minmax(170px,1fr)_170px_120px] sm:items-center sm:gap-3 sm:px-4 lg:grid-cols-[minmax(0,1fr)_220px_190px_130px]">
                    <span className="truncate text-sm font-semibold sm:text-[1.02rem]">
                        {file.file_name}
                    </span>
                    <span className="text-sm font-medium sm:justify-self-center sm:text-center">
                        Line Items: {fileLineItemCount}
                    </span>
                    <span className="text-sm font-semibold sm:justify-self-start">
                        Created At: {new Date(file.created_at).toLocaleDateString()}
                    </span>
                    <span className="inline-flex h-8 items-center gap-2 sm:justify-self-end">
                        <Button
                            htmlType="button"
                            aria-label="Approve quote file"
                            disabled={activeTab !== 'review' || Boolean(file.is_Verifed ?? file.isVerified) || isVerifying}
                            variant="icon-button-1"
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-green-300 bg-green-50 text-green-700 transition-colors hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50 ${activeTab !== 'review' ? 'invisible pointer-events-none' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation()

                                if (activeTab !== 'review') return
                                if (!quoteId || Boolean(file.is_Verifed ?? file.isVerified)) return

                                setPendingVerification({ id: file.id, file_name: file.file_name })
                            }}
                        >
                            <CheckOutlined />
                        </Button>
                        <Button
                            htmlType="button"
                            aria-label="Reject quote file"
                            disabled={activeTab !== 'review'}
                            variant="icon-button-2"
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-300 bg-red-50 text-red-700 transition-colors hover:bg-red-100 ${activeTab !== 'review' ? 'invisible pointer-events-none' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation()
                                if (activeTab !== 'review') return
                                messageApi.info('Reject action will be implemented soon')
                            }}
                        >
                            <CloseOutlined />
                        </Button>
                    </span>
                </div>
            ),
            children: renderableTables.length ? (
                <div className="space-y-5">
                    {renderableTables.map((table) => {
                        const columns: ColumnsType<Record<string, unknown> & { id: string }> = [
                            {
                                title: 'S.No',
                                key: 'sno',
                                width: 60,
                                render: (_: unknown, _record: Record<string, unknown> & { id: string }, index: number) => (
                                    <span className="flex items-center justify-center text-slate-700">{index + 1}</span>
                                ),
                            },
                            ...table.columns.map((name) => ({
                                title: name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
                                dataIndex: name,
                                key: name,
                                render: (value: unknown) => (
                                    <span className="text-slate-700">{formatCellValue(value)}</span>
                                ),
                            })),
                        ]

                        return (
                            <section key={table.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-900">{table.title}</h3>
                                    </div>
                                    <span className="text-xs font-medium text-slate-500">{table.rows.length} rows</span>
                                </div>

                                <div className="p-3 sm:p-4">
                                    {table.rows.length ? (
                                        <Table
                                            columns={columns}
                                            dataSource={table.rows}
                                            rowKey={(record) => record.id as string}
                                            scroll={{ x: 980 }}
                                            pagination={{ pageSize: 10, showSizeChanger: false }}
                                        />
                                    ) : (
                                        <p className="text-sm text-slate-500">No extracted rows found for this table.</p>
                                    )}
                                </div>
                            </section>
                        )
                    })}
                </div>
            ) : (
                <p className="text-sm text-slate-500">No extracted rows found for this file.</p>
            ),
        }
    }), [activeTab, visibleFiles, isVerifying, messageApi, quoteId])

    // ← Fix late render: key forces Collapse to remount when data arrives,
    //   so defaultActiveKey is evaluated after files are populated
    const collapseKey = `${activeTab}-${visibleFiles[0]?.id ?? 'empty'}`
    const handleBackToQuotes = () => {
        if (window.history.length > 1) {
            router.back()
            return
        }

        router.push('/quote')
    }

    return (
        <div className="px-2 pb-3 pt-3 sm:px-4 sm:pb-6 sm:pt-4 lg:px-6 lg:pb-8 lg:pt-5">
            {contextHolder}

            <Modal
                open={Boolean(pendingVerification)}
                title="Verify Quote File"
                onCancel={closeVerificationModal}
                destroyOnHidden
                footer={(
                    <div className="flex justify-end gap-3">
                        <Button
                            htmlType="button"
                            variant="secondary"
                            onClick={closeVerificationModal}
                            disabled={isVerifying}
                        >
                            Cancel
                        </Button>
                        <Button
                            htmlType="button"
                            variant="primary"
                            onClick={handleConfirmVerification}
                            disabled={isVerifying}
                        >
                            {isVerifying ? 'Verifying...' : 'Confirm'}
                        </Button>
                    </div>
                )}
            >
                <p className="text-sm leading-6 text-slate-600">
                    Are you sure you want to verify this quote file
                    {' '}
                    <span className="font-semibold text-slate-900">{pendingVerification?.file_name ?? 'this quote file'}</span>
                    ?
                </p>
            </Modal>

            <div className="mb-3 flex items-center">
                <Button
                    variant="secondary"
                    onClick={handleBackToQuotes}
                    style={{ height: 40, padding: '0 14px', borderRadius: 10, fontSize: 14, fontWeight: 600 }}
                >
                    <span className="inline-flex items-center gap-2">
                        <ArrowLeftOutlined />
                        Back to Quotes
                    </span>
                </Button>
            </div>

            <div className="mb-6 rounded-3xl border border-slate-200 bg-[linear-gradient(130deg,#ffffff_0%,#f0fdfa_100%)] p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-600">Quote Files</p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                            {data?.quote?.formattedQuoteNumber ?? 'Quote'}
                        </h1>
                        <p className="mt-2 text-sm text-slate-600">
                            {data?.quote?.name || 'Quote detail view'}
                        </p>
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Files</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">{data?.counts.fileCount ?? 0}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Line Items</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">{lineItemCount}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Status</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">{data?.quote?.status ?? 'N/A'}</p>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-slate-900">Quote Files</h2>
                    <span className="text-sm text-slate-500">{files.length} total</span>
                </div>

                <div className="mb-4 flex items-center gap-6 border-b border-slate-200">
                    <button
                        type="button"
                        onClick={() => setActiveTab('review')}
                        className={`-mb-px border-b-2 px-0 py-2 text-sm font-medium transition-colors ${
                            activeTab === 'review'
                                ? 'border-slate-900 text-slate-900'
                                : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        Review Quotes
                        {reviewFiles.length > 0 && (
                            <span className="ml-1.5 inline-flex min-w-4 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                                {reviewFiles.length}
                            </span>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('profitability')}
                        className={`-mb-px border-b-2 px-0 py-2 text-sm font-medium transition-colors ${
                            activeTab === 'profitability'
                                ? 'border-slate-900 text-slate-900'
                                : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        Profitability
                        {profitabilityFiles.length > 0 && (
                            <span className="ml-1.5 inline-flex min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                                {profitabilityFiles.length}
                            </span>
                        )}
                    </button>
                </div>

                {loading && <p className="mt-3 text-sm text-slate-500">Loading files...</p>}

                {!loading && !visibleFiles.length && (
                    <p className="mt-3 text-sm text-slate-500">No files found for this quote.</p>
                )}

                {!loading && visibleFiles.length > 0 && (
                    <Collapse
                        key={collapseKey}
                        className="quote-files-collapse"
                        variant="panel"
                        items={collapseItems}
                        accordion
                        ghost
                    />
                )}
            </div>

                        <QuoteFilesCollapseGlobalStyle />
        </div>
    )
}

export default QuoteDetailsPage
