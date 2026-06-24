"use client";

import React, { useState } from "react";
import Table from "@/components/common/Table";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import Tag from "@/components/common/Tag";
import { DeleteOutlined, EyeOutlined, FilePdfOutlined } from "@/components/common/antd/icons";
import type { PdfTable } from "@/store/services/types";
import { isMultiTableExtractedData, isStructuredExtractedData } from "@/store/services/pdf/apiSlice";
import { StyledPdfList } from "@/components/pdf/PdfList.styles";

type Props = {
  pdfs: PdfTable[];
  loading?: boolean;
  deletingId?: string | null;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
};

const PdfList: React.FC<Props> = ({ pdfs, loading, deletingId, onView, onDelete }) => {
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const columns = [
    {
      title: "Table",
      key: "title",
      render: (_: unknown, record: PdfTable) => record.title || record.sourceFileName || record.id,
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
      render: (_: unknown, record: PdfTable) => {
        const rowCount = record.rows.filter((row) => !row.isDeleted).length
        const columnCount = record.columns.length

        if (rowCount > 0 && columnCount > 0) {
          return (
            <div className="flex flex-col gap-1">
              <Tag variant="status" color="green" className="w-fit">Structured</Tag>
              <span className="text-xs text-slate-500">{rowCount} rows • {columnCount} columns</span>
            </div>
          )
        }

        if (record.sourceFileName) {
          return (
            <div className="flex flex-col gap-1">
              <Tag variant="status" color="blue" className="w-fit">Imported</Tag>
              <span className="text-xs text-slate-500">Source: {record.sourceFileName}</span>
            </div>
          )
        }

        return (
          <div className="flex flex-col gap-1">
            <Tag variant="default" color="default" className="w-fit">Empty</Tag>
            <span className="text-xs text-slate-500">No extracted rows found</span>
          </div>
        )
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: PdfTable) => (
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
        <Table variant="compact" columns={columns as any} dataSource={pdfs} rowKey={(r: PdfTable) => r.id} loading={loading} />
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
