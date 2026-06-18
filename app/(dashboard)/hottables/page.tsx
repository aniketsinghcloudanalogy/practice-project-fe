'use client'

import React, { useState } from 'react'
import AntUpload from '@/components/common/antd/Upload'
import Table from '@/components/common/Table'
import Tag from '@/components/common/Tag'
import Space from '@/components/common/Space'
import Spin from '@/components/common/Spin'
import Empty from '@/components/common/Empty'
import Message from '@/components/common/Message'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import Typography from '@/components/common/Typography'
import {
  UploadOutlined,
  FileTextOutlined,
  TableOutlined,
  ArrowRightOutlined,
  InboxOutlined,
  DeleteOutlined,
} from '@/components/common/antd/icons'
import Link from 'next/link'
import {
  useGetAiPdfUploadsQuery,
  useExtractAiPdfMutation,
  useDeleteAiPdfUploadMutation,
} from '@/store/services/aiPdf/apiSlice'
import type { AiPdfUploadListItem } from '@/store/services/aiPdf/types'

const { Title, Text } = Typography
const { Dragger } = AntUpload

// ─── Component ────────────────────────────────────────────────────────────────

export default function HotTablesPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AiPdfUploadListItem | null>(null)
  const [messageApi, contextHolder] = Message.useMessage()

  const { data: uploads = [], isLoading: uploadsLoading } = useGetAiPdfUploadsQuery()
  const [extractAiPdf, { isLoading: extracting }] = useExtractAiPdfMutation()
  const [deleteAiPdfUpload, { isLoading: deletingUpload }] = useDeleteAiPdfUploadMutation()

  const handleUpload = async () => {
    if (!selectedFile) return
    try {
      const result = await extractAiPdf(selectedFile).unwrap()
      messageApi.success(`Extracted ${result.tableCount} table(s) successfully`)
      setSelectedFile(null)
    } catch (err: any) {
      messageApi.error(err?.data?.message || 'Upload failed')
    }
  }

  const handleDeleteUpload = async () => {
    if (!deleteTarget) return

    try {
      await deleteAiPdfUpload(deleteTarget.id).unwrap()
      messageApi.success('PDF deleted successfully')
      setDeleteTarget(null)
    } catch (err: any) {
      messageApi.error(err?.data?.message || 'Failed to delete PDF')
    }
  }

  const tableColumns = [
    {
      title: 'File',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (name: string) => (
        <Space>
          <FileTextOutlined className="text-indigo-500" />
          <span className="text-sm font-medium text-indigo-500">{name}</span>
        </Space>
      ),
    },
    {
      title: 'Tables',
      key: 'tableCount',
      render: (_: any, record: AiPdfUploadListItem) => (
        <Tag
          icon={<TableOutlined />}
          className="rounded-md border-none bg-indigo-50 font-semibold text-indigo-500"
        >
          {record._count.tables} {record._count.tables === 1 ? 'table' : 'tables'}
        </Tag>
      ),
    },
    {
      title: 'Uploaded',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <Text className="text-[13px] text-slate-400">
          {new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      width: 220,
      render: (_: any, record: AiPdfUploadListItem) => (
        <Space>
          <Button
            variant="icon-button-2"
            icon={<DeleteOutlined />}
            onClick={() => setDeleteTarget(record)}
          >

          </Button>

          <Link href={`/hottables/tables/${record.id}`}>
            <Button
              icon={<ArrowRightOutlined />}
              iconPlacement="end"
              className="h-8 rounded-[7px] border border-slate-200 px-3 text-[13px] font-medium text-slate-800 hover:!border-indigo-500 hover:!text-indigo-500"
            >
              Open
            </Button>
          </Link>
        </Space>
      ),
    },
  ]

  const totalTables = uploads.reduce((sum, u) => sum + u._count.tables, 0)

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {contextHolder}

      <Modal
        open={Boolean(deleteTarget)}
        footer={null}
        onCancel={() => setDeleteTarget(null)}
        width={420}
      >
        <Title level={5} className="mb-4">
          Delete this PDF?
        </Title>

        <Text className="mb-6 block text-neutral-500">
          {deleteTarget
            ? `"${deleteTarget.fileName}" will be removed from your PDF list and its extracted tables will be hidden.`
            : ''}
        </Text>

        <div className="flex justify-end gap-3">
          <Button onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>

          <Button
            danger
            type="primary"
            loading={deletingUpload}
            onClick={handleDeleteUpload}
          >
            Delete PDF
          </Button>
        </div>
      </Modal>

      {/* ── Hero ── */}
      <div className="relative mb-8 flex items-center justify-between gap-8 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#1d1f2b_0%,#2d3250_100%)] px-12 py-12 before:pointer-events-none before:absolute before:right-20 before:top-[-80px] before:h-80 before:w-80 before:bg-[radial-gradient(circle,rgba(99,102,241,0.2)_0%,transparent_70%)] before:content-['']">
        <div className="z-[1] flex-1">
          <div className="mb-5 flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-indigo-500" />
            <span className="inline-block h-2 w-2 rounded-full bg-indigo-500" />
            <span className="inline-block h-2 w-2 rounded-full bg-white/20" />
            <span className="text-xs font-semibold uppercase tracking-[1.5px] text-indigo-500">PDF → Tables</span>
          </div>
          <Title level={2} className="mb-3 text-[32px] font-bold tracking-[-0.5px] !text-white">
            Extract tables from any PDF
          </Title>
          <p className="mb-0 max-w-[480px] text-[15px] leading-7 text-white/60">
            Upload a PDF containing one or more tables. The AI reads the document, identifies every
            table, and renders them as live, editable grids — ready to view, filter, and export.
          </p>
        </div>

        <div className="z-[1] flex shrink-0 gap-6">
          <div className="rounded-xl border border-white/10 bg-white/6 px-7 py-5 text-center backdrop-blur-[8px]">
            <Title level={3} className="mb-1 text-[28px] font-bold !text-white">
              {uploads.length}
            </Title>
            <span className="text-xs text-white/45">PDFs uploaded</span>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/6 px-7 py-5 text-center backdrop-blur-[8px]">
            <Title level={3} className="mb-1 text-[28px] font-bold !text-white">
              {totalTables}
            </Title>
            <span className="text-xs text-white/45">Tables extracted</span>
          </div>
        </div>
      </div>

      {/* ── Upload ── */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-7">
        <div className="mb-5 flex items-center justify-between">
          <Title level={4} className="mb-0 text-base font-semibold text-[#1d1f2b]">
            Upload a PDF
          </Title>
          {selectedFile && (
            <Text className="text-[13px] text-slate-400">
              Ready:{' '}
              <span className="font-medium text-indigo-500">{selectedFile.name}</span>
            </Text>
          )}
        </div>

        <Dragger
          accept=".pdf"
          showUploadList={false}
          beforeUpload={(file) => {
            setSelectedFile(file)
            return false
          }}
          className="[&_.ant-upload-drag]:!rounded-[10px] [&_.ant-upload-drag]:!border-2 [&_.ant-upload-drag]:!border-dashed [&_.ant-upload-drag]:!border-indigo-200 [&_.ant-upload-drag]:!bg-slate-50 [&_.ant-upload-drag]:!transition-all [&_.ant-upload-drag:hover]:!border-indigo-500 [&_.ant-upload-drag:hover]:!bg-indigo-50 [&_.ant-upload-drag-icon_.anticon]:!text-4xl [&_.ant-upload-drag-icon_.anticon]:!text-indigo-500 [&_.ant-upload-hint]:!text-[13px] [&_.ant-upload-hint]:!text-slate-400 [&_.ant-upload-text]:!text-[15px] [&_.ant-upload-text]:!font-semibold [&_.ant-upload-text]:!text-[#1d1f2b]"
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            {selectedFile ? selectedFile.name : 'Drop a PDF here or click to browse'}
          </p>
          <p className="ant-upload-hint">Single PDF up to 1 MB · Tables are extracted automatically</p>
        </Dragger>

        <div className="text-right">
          <Button
            type="primary"
            icon={<UploadOutlined />}
            loading={extracting}
            disabled={!selectedFile}
            onClick={handleUpload}
            className="mt-4 h-10 rounded-lg border-indigo-500 bg-indigo-500 px-6 font-semibold hover:!border-indigo-600 hover:!bg-indigo-600"
          >
            {extracting ? 'Extracting…' : 'Upload & Extract'}
          </Button>
        </div>
      </div>

      {/* ── Upload List ── */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-7">
        <div className="mb-5 flex items-center justify-between">
          <Title level={4} className="mb-0 text-base font-semibold text-[#1d1f2b]">
            Your PDFs
          </Title>
          <Text className="text-[13px] text-slate-400">
            {uploads.length} {uploads.length === 1 ? 'document' : 'documents'}
          </Text>
        </div>

        {uploadsLoading ? (
          <div className="py-12 text-center">
            <Spin size="large" />
          </div>
        ) : uploads.length === 0 ? (
          <div className="py-12 text-center">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Text className="text-slate-400">
                  No PDFs yet. Upload one above to get started.
                </Text>
              }
            />
          </div>
        ) : (
          <Table
            dataSource={uploads}
            columns={tableColumns}
            rowKey="id"
            pagination={{ pageSize: 8, size: 'small' }}
            size="middle"
            className="overflow-hidden rounded-lg"
          />
        )}
      </div>
    </div>
  )
}
