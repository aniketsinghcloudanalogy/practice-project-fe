'use client'

import React, { useState } from 'react'
import Upload from '@/components/common/Upload'
import Table from '@/components/common/Table'
import Tag from '@/components/common/Tag'
import Space from '@/components/common/Space'
import Spin from '@/components/common/Spin'
import Empty from '@/components/common/Empty'
import Message from '@/components/common/Message'
import Typography from '@/components/common/Typography'
import {
  UploadOutlined,
  FileTextOutlined,
  TableOutlined,
  ArrowRightOutlined,
  InboxOutlined,
} from '@/components/common/antd/icons'
import Link from 'next/link'
import {
  useGetAiPdfUploadsQuery,
  useExtractAiPdfMutation,
} from '@/store/services/aiPdf/apiSlice'
import type { AiPdfUploadListItem } from '@/store/services/aiPdf/types'
import {
  PageWrapper,
  HeroCard,
  HeroLeft,
  HeroTitle,
  HeroSubtitle,
  StepBadge,
  StepDot,
  StepLabel,
  StatGrid,
  StatBox,
  StatNumber,
  StatLabel,
  SectionCard,
  SectionHeader,
  SectionTitle,
  StyledDragger,
  UploadButton,
  FileNameText,
  OpenButton,
  EmptyWrapper,
} from '@/components/hottables/HotTablesPage.styles'

const { Title, Text, Paragraph } = Typography

// ─── Component ────────────────────────────────────────────────────────────────

export default function HotTablesPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [messageApi, contextHolder] = Message.useMessage()

  const { data: uploads = [], isLoading: uploadsLoading } = useGetAiPdfUploadsQuery()
  const [extractAiPdf, { isLoading: extracting }] = useExtractAiPdfMutation()

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

  const tableColumns = [
    {
      title: 'File',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (name: string) => (
        <Space>
          <FileTextOutlined style={{ color: '#6366f1' }} />
          <FileNameText>{name}</FileNameText>
        </Space>
      ),
    },
    {
      title: 'Tables',
      key: 'tableCount',
      render: (_: any, record: AiPdfUploadListItem) => (
        <Tag
          icon={<TableOutlined />}
          style={{
            background: '#f0f1ff',
            color: '#6366f1',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
          }}
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
        <Text style={{ color: '#8b8fa8', fontSize: 13 }}>
          {new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </Text>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 100,
      render: (_: any, record: AiPdfUploadListItem) => (
        <Link href={`/hottables/tables/${record.id}`}>
          <OpenButton icon={<ArrowRightOutlined />} iconPlacement="end">
            Open
          </OpenButton>
        </Link>
      ),
    },
  ]

  const totalTables = uploads.reduce((sum, u) => sum + u._count.tables, 0)

  return (
    <PageWrapper>
      {contextHolder}

      {/* ── Hero ── */}
      <HeroCard>
        <HeroLeft>
          <StepBadge>
            <StepDot $active />
            <StepDot $active />
            <StepDot />
            <StepLabel>PDF → Tables</StepLabel>
          </StepBadge>
          <HeroTitle level={2}>Extract tables from any PDF</HeroTitle>
          <HeroSubtitle>
            Upload a PDF containing one or more tables. The AI reads the document, identifies every
            table, and renders them as live, editable grids — ready to view, filter, and export.
          </HeroSubtitle>
        </HeroLeft>

        <StatGrid>
          <StatBox>
            <StatNumber level={3}>{uploads.length}</StatNumber>
            <StatLabel>PDFs uploaded</StatLabel>
          </StatBox>
          <StatBox>
            <StatNumber level={3}>{totalTables}</StatNumber>
            <StatLabel>Tables extracted</StatLabel>
          </StatBox>
        </StatGrid>
      </HeroCard>

      {/* ── Upload ── */}
      <SectionCard>
        <SectionHeader>
          <SectionTitle level={4}>Upload a PDF</SectionTitle>
          {selectedFile && (
            <Text style={{ color: '#8b8fa8', fontSize: 13 }}>
              Ready:{' '}
              <span style={{ color: '#6366f1', fontWeight: 500 }}>{selectedFile.name}</span>
            </Text>
          )}
        </SectionHeader>

        <StyledDragger
          accept=".pdf"
          showUploadList={false}
          beforeUpload={(file) => {
            setSelectedFile(file)
            return false
          }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            {selectedFile ? selectedFile.name : 'Drop a PDF here or click to browse'}
          </p>
          <p className="ant-upload-hint">Single PDF up to 1 MB · Tables are extracted automatically</p>
        </StyledDragger>

        <div style={{ textAlign: 'right' }}>
          <UploadButton
            type="primary"
            icon={<UploadOutlined />}
            loading={extracting}
            disabled={!selectedFile}
            onClick={handleUpload}
          >
            {extracting ? 'Extracting…' : 'Upload & Extract'}
          </UploadButton>
        </div>
      </SectionCard>

      {/* ── Upload List ── */}
      <SectionCard>
        <SectionHeader>
          <SectionTitle level={4}>Your PDFs</SectionTitle>
          <Text style={{ color: '#8b8fa8', fontSize: 13 }}>
            {uploads.length} {uploads.length === 1 ? 'document' : 'documents'}
          </Text>
        </SectionHeader>

        {uploadsLoading ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <Spin size="large" />
          </div>
        ) : uploads.length === 0 ? (
          <EmptyWrapper>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Text style={{ color: '#8b8fa8' }}>
                  No PDFs yet. Upload one above to get started.
                </Text>
              }
            />
          </EmptyWrapper>
        ) : (
          <Table
            dataSource={uploads}
            columns={tableColumns}
            rowKey="id"
            pagination={{ pageSize: 8, size: 'small' }}
            size="middle"
            style={{ borderRadius: 8 }}
          />
        )}
      </SectionCard>
    </PageWrapper>
  )
}
