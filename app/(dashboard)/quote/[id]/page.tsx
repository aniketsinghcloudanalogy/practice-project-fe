"use client";

import React, { useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Button from '@/components/common/Button'
import Message from '@/components/common/Message'
import Table from '@/components/common/Table'
import type { ColumnsType } from '@/components/common/Table/types'
import { useGetQuoteDetailQuery } from '@/store/services/quote/apiSlice'
import type { QuoteFile } from '@/store/services/quote/types'
import { ArrowLeftOutlined } from '@/components/common/antd/icons'

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

  const columns: ColumnsType<QuoteFile> = useMemo(() => [
    {
      title: 'File Name',
      dataIndex: 'file_name',
      key: 'file_name',
      render: (name: string) => <span className="font-medium text-slate-800">{name}</span>,
    },
    {
      title: 'Line Items',
      key: 'lineItems',
      width: 150,
      render: (_: unknown, record: QuoteFile) => (
        <span className="font-semibold text-slate-900">{record.lineItems?.length ?? 0}</span>
      ),
    },
    {
      title: 'Uploaded',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (createdAt: string) => (
        <span className="text-slate-500">{new Date(createdAt).toLocaleDateString()}</span>
      ),
    },
  ], [])

  return (
    <div className="px-2 pb-3 pt-0 sm:px-4 sm:pb-6  lg:px-6 lg:pb-8">
      {contextHolder}
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => router.push('/quote')}>
          <ArrowLeftOutlined className="mr-2" />
          Back to Quotes
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

        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={files}
            rowKey="id"
            loading={loading}
            scroll={{ x: 680 }}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            locale={{ emptyText: 'No files found for this quote.' }}
          />
        </div>
      </div>
    </div>
  )
}

export default QuoteDetailsPage
