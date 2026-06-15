"use client";

import React, { useState } from "react";
import Table from "@/components/common/Table";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import Tag from "@/components/common/Tag";
import { DeleteOutlined, EyeOutlined, FilePdfOutlined } from "@/components/common/antd/icons";
import type { PdfDocument } from "@/store/services/types";
import { isMultiTableExtractedData, isStructuredExtractedData } from "@/store/services/pdf/apiSlice";
import { StyledPdfList } from "@/components/pdf/PdfList.styles";

type Props = {
  pdfs: PdfDocument[];
  loading?: boolean;
  deletingId?: string | null;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
};

const PdfList: React.FC<Props> = ({ pdfs, loading, deletingId, onView, onDelete }) => {
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const columns = [
    {
      title: "File name",
      dataIndex: "fileName",
      key: "fileName",
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: "Extracted data",
      key: "extractedData",
      render: (_: unknown, record: PdfDocument) => {
        const structuredData = isStructuredExtractedData(record.extractedData) ? record.extractedData : null
        const multiTableData = isMultiTableExtractedData(record.extractedData) ? record.extractedData : null
        const rowCount = structuredData ? structuredData.rows.length : 0
        const columnCount = structuredData ? structuredData.columns.length : 0
        const tableCount = multiTableData ? multiTableData.tables.length : 0

        if (structuredData && rowCount > 0 && columnCount > 0) {
          return (
            <div className="flex flex-col gap-1">
              <Tag variant="status" color="green" className="w-fit">Structured</Tag>
              <span className="text-xs text-slate-500">{rowCount} rows • {columnCount} columns</span>
            </div>
          )
        }

        if (multiTableData && tableCount > 0) {
          return (
            <div className="flex flex-col gap-1">
              <Tag variant="status" color="green" className="w-fit">Multiple tables</Tag>
              <span className="text-xs text-slate-500">{tableCount} tables detected</span>
            </div>
          )
        }

        if (record.extractedData && (Array.isArray(record.extractedData) ? record.extractedData.length > 0 : Object.keys(record.extractedData).length > 0)) {
          return (
            <div className="flex flex-col gap-1">
              <Tag variant="status" color="blue" className="w-fit">Custom JSON</Tag>
              <span className="text-xs text-slate-500">Stored but not structured for table view</span>
            </div>
          )
        }

        return (
          <div className="flex flex-col gap-1">
            <Tag variant="default" color="default" className="w-fit">Empty</Tag>
            <span className="text-xs text-slate-500">No structured data found</span>
          </div>
        )
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: PdfDocument) => (
        <div className="pdf-list-actions">
          <Button variant="secondary" size="small" icon={<EyeOutlined />} onClick={() => onView(record.id)}>
            View
          </Button>
          <Button
            variant="danger"
            size="small"
            icon={<DeleteOutlined />}
            loading={deletingId === record.id}
            onClick={() => setDeleteTargetId(record.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (!loading && pdfs.length === 0) {
    return (
      <StyledPdfList>
        <div className="pdf-empty-state">
          <div className="pdf-empty-state__icon">
            <FilePdfOutlined className="text-3xl text-slate-400" />
          </div>
          <h4 className="pdf-empty-state__title">No PDFs uploaded yet</h4>
          <p className="pdf-empty-state__copy">
            Upload a PDF to extract structured rows. Your processed files will appear here once the backend finishes processing.
          </p>
        </div>
      </StyledPdfList>
    );
  }

  return (
    <StyledPdfList>
      <div className="pdf-list-table">
        <Table variant="compact" columns={columns as any} dataSource={pdfs} rowKey={(r: PdfDocument) => r.id} loading={loading} />
      </div>

      <Modal
        open={Boolean(deleteTargetId)}
        title="Delete PDF"
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: Boolean(deleteTargetId && deletingId === deleteTargetId) }}
        onOk={() => {
          if (!deleteTargetId) return
          const targetId = deleteTargetId
          setDeleteTargetId(null)
          onDelete(targetId)
        }}
        onCancel={() => setDeleteTargetId(null)}
        centered
      >
        <p className="text-sm leading-6 text-slate-600">
          Are you sure you want to delete this PDF? This action cannot be undone.
        </p>
      </Modal>
    </StyledPdfList>
  );
};

export default PdfList;
