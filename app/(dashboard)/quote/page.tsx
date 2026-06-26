"use client";

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Message from '@/components/common/Message'
import Modal from '@/components/common/Modal'
import Table from '@/components/common/Table'
import type { ColumnsType } from '@/components/common/Table/types'
import Button from '@/components/common/Button'
import AntUpload from '@/components/common/antd/Upload'
import { DeleteOutlined, InboxOutlined } from '@/components/common/antd/icons'
import {
    useCreateQuoteMutation,
    useGetQuotesQuery,
} from '@/store/services/quote/apiSlice'
import type { QuoteListItem } from '@/store/services/quote/types'

const { Dragger } = AntUpload

const getErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === 'string') {
        return error
    }

    if (error && typeof error === 'object') {
        const maybeError = error as {
            status?: unknown
            error?: unknown
            message?: unknown
            data?: { message?: unknown }
        }

        const isRateLimit =
            maybeError.status === 429
            || (typeof maybeError.data?.message === 'string' && maybeError.data.message.toLowerCase().includes('rate limit'))
            || (typeof maybeError.message === 'string' && maybeError.message.toLowerCase().includes('rate limit'))
            || (typeof maybeError.error === 'string' && maybeError.error.toLowerCase().includes('429'))

        if (isRateLimit) {
            return 'Groq API rate limit exceeded. Please wait a moment and try again.'
        }

        if (typeof maybeError.data?.message === 'string') {
            return maybeError.data.message
        }

        if (typeof maybeError.error === 'string') {
            return maybeError.error
        }

        if (typeof maybeError.message === 'string') {
            return maybeError.message
        }
    }

    return fallback
}

const QuotePage = () => {
    const router = useRouter()
    const [isImportModalOpen, setIsImportModalOpen] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [messageApi, contextHolder] = Message.useMessage()

    const {
        data: quotes = [],
        isLoading,
        isFetching,
    } = useGetQuotesQuery(undefined, {
        refetchOnMountOrArgChange: false,
        refetchOnFocus: true,
        refetchOnReconnect: true,
    })
    const [createQuote, { isLoading: creatingQuote }] = useCreateQuoteMutation()

    const loading = isLoading || isFetching

    const openImportModal = () => {
        setIsImportModalOpen(true)
    }

    const closeImportModal = () => {
        if (creatingQuote) {
            return
        }

        setIsImportModalOpen(false)
        setSelectedFiles([])
    }

    const addFiles = (incomingFiles: File[]) => {
        const nonPdfFile = incomingFiles.find((file) => file.type !== 'application/pdf')
        if (nonPdfFile) {
            messageApi.error('Only PDF files are allowed')
            return
        }

        setSelectedFiles((previous) => {
            const mergedFiles = [...previous]

            incomingFiles.forEach((incomingFile) => {
                const duplicate = mergedFiles.some(
                    (file) =>
                        file.name === incomingFile.name
                        && file.size === incomingFile.size
                        && file.lastModified === incomingFile.lastModified,
                )

                if (!duplicate) {
                    mergedFiles.push(incomingFile)
                }
            })

            return mergedFiles
        })
    }

    const removeSelectedFile = (indexToRemove: number) => {
        setSelectedFiles((previous) => previous.filter((_, index) => index !== indexToRemove))
    }

    const handleCreateQuote = async (files: File[]) => {
        if (files.length === 0) {
            return
        }

        const baseName = files[0].name.replace(/\.[^/.]+$/, '') || 'Quote'

        try {
            await createQuote({
                name: baseName,
                files,
            }).unwrap()

            messageApi.success('Quote created successfully')
            setIsImportModalOpen(false)
            setSelectedFiles([])
        } catch (error: unknown) {
            messageApi.error(getErrorMessage(error, 'Failed to create quote'))
        }
    }

    const handleImportQuote = async () => {
        await handleCreateQuote(selectedFiles)
    }

    const columns: ColumnsType<QuoteListItem> = useMemo(() => [
        {
            title: 'Quote No',
            dataIndex: 'formattedQuoteNumber',
            key: 'formattedQuoteNumber',
            width: 180,
            render: (_: string, record: QuoteListItem) => (
                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation()
                        router.push(`/quote/${record.id}`)
                    }}
                    className="cursor-pointer text-left font-semibold text-cyan-700 hover:text-cyan-900"
                >
                    {record.formattedQuoteNumber}
                </button>
            ),
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (value: string) => <span className="text-slate-700">{value || '-'}</span>,
        },
        {
            title: 'Files',
            dataIndex: 'fileCount',
            key: 'fileCount',
            width: 120,
            render: (count: number) => <span className="font-semibold text-slate-900">{count}</span>,
        },
        {
            title: 'Line Items',
            dataIndex: 'lineItemCount',
            key: 'lineItemCount',
            width: 140,
            render: (count: number) => <span className="font-semibold text-slate-900">{count ?? 0}</span>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 140,
            render: (status: string | null) => (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600">
                    {status || 'N/A'}
                </span>
            ),
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 180,
            render: (date?: string | null) => (
                <span className="text-slate-500">
                    {date ? new Date(date).toLocaleDateString() : '-'}
                </span>
            ),
        },
    ], [router])

    return (
        <div className="px-2 pb-3 pt-0 sm:px-4 sm:pb-6">
            {contextHolder}

            <Modal
                open={isImportModalOpen}
                title="Upload Quotes"
                onCancel={closeImportModal}
                footer={null}
                width={640}
                destroyOnHidden
            >
                <Dragger
                    accept=".pdf"
                    multiple
                    showUploadList={false}
                    beforeUpload={(file) => {
                        addFiles([file])
                        return false
                    }}
                    onDrop={(event) => {
                        const droppedFiles = Array.from(event.dataTransfer.files ?? [])
                        addFiles(droppedFiles)
                    }}
                    className="[&_.ant-upload-drag]:rounded-[10px]! [&_.ant-upload-drag]:border! [&_.ant-upload-drag]:border-slate-300! [&_.ant-upload-drag]:bg-slate-50! [&_.ant-upload-drag]:px-5! [&_.ant-upload-drag]:py-6! [&_.ant-upload-drag:hover]:border-cyan-600! [&_.ant-upload-drag:hover]:bg-cyan-50!"
                >
                    <p className="ant-upload-drag-icon mb-2 text-slate-400">
                        <InboxOutlined className="text-[28px]" />
                    </p>
                    <p className="ant-upload-text text-[15px] font-medium text-slate-700">
                        Click to Upload or Drag and Drop
                    </p>
                    <p className="ant-upload-hint text-xs text-slate-500"> PDF</p>
                </Dragger>

                {selectedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {selectedFiles.map((file, index) => (
                            <div key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2">
                                <span className="truncate pr-3 text-sm text-slate-700">{file.name}</span>
                                <button
                                    type="button"
                                    onClick={() => removeSelectedFile(index)}
                                    className="inline-flex h-7 w-7 items-center justify-center rounded text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                                    aria-label={`Remove ${file.name}`}
                                >
                                    <DeleteOutlined />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-5 flex items-center justify-end gap-2">
                    <Button onClick={closeImportModal} disabled={creatingQuote}>Cancel</Button>
                    <Button
                        variant="primary"
                        loading={creatingQuote}
                        disabled={selectedFiles.length === 0}
                        onClick={handleImportQuote}
                    >
                        Process Quotes
                    </Button>
                </div>
            </Modal>

            <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-[linear-gradient(140deg,#f8fafc_0%,#ecfeff_100%)] p-6 shadow-[0_20px_60px_rgba(14,116,144,0.08)]">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-600">Quote Workspace</p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Manage quotes and uploaded files</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            Upload one or more PDF files to create a new quote. The list below always shows the latest quotes saved in the database.
                        </p>
                    </div>

                    <div className="w-full max-w-sm rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Create Quote</p>
                        <p className="mt-2 text-sm text-slate-600">Choose PDF files in the import modal before creating your quote.</p>
                        <Button
                            variant="primary"
                            onClick={openImportModal}
                            className="mt-4 w-full"
                        >
                            Add Quote
                        </Button>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-slate-900">Quotes</h2>
                    <span className="text-sm text-slate-500">{quotes.length} total</span>
                </div>

                <div className="overflow-x-auto">
                    <Table
                        columns={columns}
                        dataSource={quotes}
                        rowKey="id"
                        loading={loading}
                        scroll={{ x: 920 }}
                        onRow={(record) => ({
                            onClick: () => router.push(`/quote/${record.id}`),
                            className: 'cursor-pointer',
                        })}
                        pagination={{ pageSize: 10, showSizeChanger: false }}
                        locale={{ emptyText: 'No quotes found. Create your first quote using Add Quote.' }}
                    />
                </div>
            </div>
        </div>
    )
}

export default QuotePage
