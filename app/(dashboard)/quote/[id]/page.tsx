"use client";

import React, { useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Button from '@/components/common/Button'
import Message from '@/components/common/Message'
import Table from '@/components/common/Table'
import Collapse from '@/components/common/Collapse'
import type { ColumnsType } from '@/components/common/Table/types'
import { useGetQuoteDetailQuery } from '@/store/services/quote/apiSlice'
import type { QuoteFile, QuoteLineItem } from '@/store/services/quote/types'
import { ArrowLeftOutlined } from '@/components/common/antd/icons'

const HIDDEN_LINE_ITEM_KEYS = new Set([
  'id',
  'isDeleted',
  'quoteFileId',
  'quote_file_id',
  'quoteId',
  'quote_id',
  'userId',
  'user_id',
  'pdfTableId',
  'pdf_table_id',
  'sourceTableTitle',
  'source_table_title',
  'rowSourceId',
  'row_source_id',
  'rowIndex',
  'row_index',
])

const formatCellValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  return JSON.stringify(value)
}

const hasMeaningfulValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return false
  }

  if (typeof value === 'string') {
    const normalized = value.trim()
    return normalized !== '' && normalized !== '-' && normalized.toLowerCase() !== 'n/a'
  }

  return true
}

const QuoteDetailsPage = () => {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const quoteId = params?.id
  const [messageApi, contextHolder] = Message.useMessage()

  const {
    data,
    isLoading,
    isFetching,
    error,
  } = useGetQuoteDetailQuery(quoteId ?? '', {
    skip: !quoteId,
  })

  React.useEffect(() => {
    if (error) {
      messageApi.error('Failed to load quote details')
    }
  }, [error, messageApi])

  const files = data?.files ?? []
  const loading = isLoading || isFetching

  const collapseItems = useMemo(() => {
    return files.map((file: QuoteFile) => {
      const lineItems = file.lineItems ?? []
      const candidateKeys = Array.from(new Set(
        lineItems.flatMap((item) => Object.keys(item).filter((key) => !HIDDEN_LINE_ITEM_KEYS.has(key))),
      ))
      const visibleKeys = candidateKeys.filter((key) =>
        lineItems.some((item) => hasMeaningfulValue(item[key])),
      )

      const lineItemColumns: ColumnsType<QuoteLineItem> = [
        ...visibleKeys.map((key) => ({
          title: key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
          dataIndex: key,
          key,
          render: (value: unknown) => <span className="text-slate-700">{formatCellValue(value)}</span>,
        })),
      ]

      return {
        key: file.id,
        label: (
          <div className="quote-file-header grid w-full grid-cols-1 items-start gap-1.5 px-3 py-3 text-white sm:grid-cols-[minmax(0,1fr)_minmax(220px,1fr)_220px] sm:items-center sm:gap-3 sm:px-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,1fr)_240px]">
            <span className="truncate text-sm font-semibold sm:text-[1.02rem]">{file.file_name}</span>
            <span className="text-sm font-medium sm:justify-self-center sm:text-center">Line Items: {lineItems.length}</span>
            <span className="text-sm font-semibold sm:text-right">Created At: {new Date(file.created_at).toLocaleDateString()}</span>
          </div>
        ),
        children: lineItems.length ? (
          <Table
            columns={lineItemColumns}
            dataSource={lineItems}
            rowKey={(record) => record.id}
            scroll={{ x: 980 }}
            pagination={{ pageSize: 10, showSizeChanger: false }}
          />
        ) : (
          <p className="text-sm text-slate-500">No line items found for this file.</p>
        ),
      }
    })
  }, [files])

  return (
    <div className="px-2 pb-3 pt-3 sm:px-4 sm:pb-6 sm:pt-4 lg:px-6 lg:pb-8 lg:pt-5">
      {contextHolder}
      <div className="mb-3 flex items-center">
        <Button
          variant="secondary"
          onClick={() => router.push('/quote')}
          style={{
            height: 40,
            padding: '0 14px',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
          }}
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
            <p className="mt-2 text-2xl font-semibold text-slate-900">{data?.counts.lineItemCount ?? 0}</p>
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

        <Collapse
          className="quote-files-collapse"
          variant="panel"
          items={collapseItems}
          defaultActiveKey={collapseItems[0] ? [collapseItems[0].key] : []}
          accordion
          ghost
        />
        {!loading && !files.length && (
          <p className="mt-3 text-sm text-slate-500">No files found for this quote.</p>
        )}
        {loading && <p className="mt-3 text-sm text-slate-500">Loading files...</p>}
      </div>

      <style jsx global>{`
        .quote-files-collapse.ant-collapse {
          border: 0;
          background: transparent;
          box-shadow: none;
        }

        .quote-files-collapse .ant-collapse-item {
          border: 0;
          margin-bottom: 10px;
          border-radius: 12px !important;
          overflow: hidden !important;
        }

        .quote-files-collapse .ant-collapse-item:last-child {
          margin-bottom: 0;
        }

        .quote-files-collapse .ant-collapse-item > .ant-collapse-header {
          background: #517a9b;
          color: #ffffff !important;
          padding: 0 !important;
          min-height: 56px;
          border-radius: 12px !important;
          overflow: hidden;
        }

        .quote-files-collapse .ant-collapse-header-text {
          flex: 1;
          min-width: 0;
          width: 100%;
        }

        .quote-file-header > span {
          min-width: 0;
        }

        .quote-files-collapse .ant-collapse-item-active > .ant-collapse-header {
          border-radius: 12px 12px 0 0 !important;
        }

        .quote-files-collapse .ant-collapse-expand-icon {
          color: #ffffff;
          padding-inline-start: 10px;
        }

        .quote-files-collapse .ant-collapse-item > .ant-collapse-content {
          border-top: 0;
          background: #f8fafc;
          border-radius: 0 0 12px 12px !important;
          overflow: hidden;
        }

        .quote-files-collapse .ant-collapse-content-box {
          padding: 14px;
        }

        @media (max-width: 640px) {
          .quote-files-collapse .ant-collapse-item > .ant-collapse-header {
            min-height: 48px;
            padding-inline-end: 10px !important;
          }

          .quote-files-collapse .ant-collapse-expand-icon {
            padding-inline-start: 8px;
            padding-inline-end: 6px;
          }

          .quote-file-header {
            gap: 4px;
            padding-top: 8px;
            padding-bottom: 8px;
          }

          .quote-file-header > span {
            white-space: normal;
            line-height: 1.25;
          }

          .quote-file-header > span:first-child {
            font-size: 0.92rem;
            font-weight: 600;
          }

          .quote-file-header > span:nth-child(2),
          .quote-file-header > span:nth-child(3) {
            font-size: 0.82rem;
          }
        }
      `}</style>
    </div>
  )
}

export default QuoteDetailsPage
