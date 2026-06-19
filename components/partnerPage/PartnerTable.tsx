import { useState } from "react";
import { LuPencil, LuSearch, LuTrash2 } from "react-icons/lu";

import Button from "@/components/common/antd/Button";
import Input from "@/components/common/Input";
import Table from "@/components/common/Table";
import Modal from "@/components/common/Modal";
import { useDeleteProgramMutation, type PartnerRow } from "@/store/services";

import { getPartnerProgramColumns } from "./partnerProgramColumns";
import FormPreviewModal from "./FormPreviewModal";
import type { PartnerProgramRow } from "./types";

export type { PartnerProgramRow } from "./types";

// Renders pre-fetched programs — no API call on expand
function ExpandedProgramsRow({
  programs,
  columns,
}: {
  programs: PartnerProgramRow[];
  columns: any[];
}) {
  return (
    <div className="bg-[#f8fbff] px-4 py-4 sm:px-5">
      <Table<PartnerProgramRow>
        variant="compact"
        columns={columns}
        dataSource={programs}
        rowKey="id"
        pagination={false}
        size="small"
        scroll={{ x: 1100 }}
      />
    </div>
  );
}

type PartnerTableProps = {
  loading: boolean;
  dataSource: PartnerRow[];
  onEdit: (record: PartnerRow) => void;
  onDelete: (record: PartnerRow) => void;
  onAddPartner: () => void;
  onAddProgram: (partnerName?: string) => void;
  programsRefreshKey?: number;
  onVerificationToggle: (checked: boolean) => void;
  role?: string | null;
  userId?: string | null;
  pagination?: { page: number; limit: number; total: number };
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  search?: string;
  onSearchChange?: (value: string) => void;
};

export default function PartnerTable({
  loading,
  dataSource,
  onEdit,
  onDelete,
  onAddPartner,
  onAddProgram,
  onVerificationToggle,
  role,
  userId,
  pagination,
  onPageChange,
  onLimitChange,
  search: externalSearch,
  onSearchChange,
}: PartnerTableProps) {
  const isSuperAdmin = role === "SUPER_ADMIN";
  const [expandedPartnerIds, setExpandedPartnerIds] = useState<number[]>([]);
  const [deletingProgram, setDeletingProgram] = useState<{ id: number; partnerProgramName: string } | null>(null);
  const [viewFormProgram, setViewFormProgram] = useState<PartnerProgramRow | null>(null);
  const [deleteProgram, { isLoading: deleteProgramLoading }] = useDeleteProgramMutation();

  // Use external search if provided (server-side), otherwise local
  const [localSearch, setLocalSearch] = useState("");
  const search = externalSearch ?? localSearch;
  const handleSearchChange = onSearchChange ?? setLocalSearch;

  const partnerProgramColumns = getPartnerProgramColumns(onVerificationToggle, {
    role,
    userId,
    actions: {
      onViewForm: (record) => setViewFormProgram(record),
      ...(isSuperAdmin ? {
        onDelete: (record) => setDeletingProgram(record),
      } : {}),
    },
  });

  const handleDeleteProgram = async () => {
    if (!deletingProgram) return;
    try {
      await deleteProgram(deletingProgram.id).unwrap();
      setDeletingProgram(null);
    } catch (error) {
      console.error('Failed to delete program:', error);
      setDeletingProgram(null);
    }
  };

  // When server-side pagination is used, no client filtering needed
  const filtered = onSearchChange ? dataSource : (
    search.trim()
      ? dataSource.filter((p) => {
          const q = search.trim().toLowerCase();
          return (
            (p["partner Name"] || "").toLowerCase().includes(q) ||
            (p.email ?? "").toLowerCase().includes(q)
          );
        })
      : dataSource
  );

  const partnerColumns = [
    {
      title: "ID",
      dataIndex: "Id",
      key: "Id",
      width: 90,
    },
    {
      title: "External ID",
      dataIndex: "External id",
      key: "External id",
      width: 150,
      render: (value: string | null) => value ?? "-",
    },
    {
      title: "Partner Name",
      dataIndex: "partner Name",
      key: "partner Name",
      width: 200,
    },
    {
      title: "Parent Partner",
      dataIndex: "parent Partner",
      key: "parent Partner",
      width: 180,
      render: (value: string | null) => value ?? "-",
    },
    {
      title: "PM ID",
      dataIndex: "PM Id",
      key: "PM Id",
      width: 150,
      render: (value: string | null) => value ?? "-",
    },
    {
      title: "URL",
      dataIndex: "url",
      key: "url",
      width: 180,
      render: (value: string | null) => value ?? "-"
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 220,
      render: (value: string | null) => value ?? "-",
    },
  ];

  if (isSuperAdmin) {
    partnerColumns.push({
      title: "Actions",
      key: "actions",
      width: 100,
      fixed: "right" as const,
      render: (_: unknown, record: PartnerRow) => (
        <div className="flex items-center gap-2">
          <Button variant="soft" aria-label="Edit partner" onClick={() => onEdit(record)}>
            <LuPencil size={16} />
          </Button>
          <Button variant="soft" aria-label="Delete partner" onClick={() => onDelete(record)}>
            <LuTrash2 size={16} className="text-red-600" />
          </Button>
        </div>
      ),
    } as any);
  }

  const columns = [Table.EXPAND_COLUMN, ...partnerColumns];

  return (
    <section className="mt-6 min-w-0">
      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 flex-1">
          <h2 className="text-2xl font-semibold text-slate-900 shrink-0">All Partners</h2>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
           <Input
            appearance="soft"
            placeholder="Search by name or email…"
            allowClear
            prefix={<LuSearch size={15} className="text-slate-400" />}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{ width: 260, height: 44, borderRadius: 8 }}
          />
          {isSuperAdmin && <Button variant="secondary" onClick={onAddPartner}>Add Partner</Button>}
          {isSuperAdmin && <Button variant="secondary" onClick={() => onAddProgram()}>Add Partner Program</Button>}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="w-full overflow-x-auto">
          <Table<PartnerRow>
            columns={columns}
            dataSource={filtered}
            rowKey="Id"
            loading={loading}
            pagination={pagination ? {
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: true,
              size: "small",
              onChange: (p, size) => {
                if (size !== pagination.limit) onLimitChange?.(size);
                else onPageChange?.(p);
              },
            } : {
              pageSize: 10,
              showSizeChanger: true,
              size: "small",
            }}
            scroll={{ x: 1200 }}
            size="small"
            expandable={{
              expandIcon: ({ expanded, onExpand, record }) => (
                <Button
                  variant="soft"
                  shape="circle"
                  htmlType="button"
                  onClick={(event) => onExpand(record, event)}
                  aria-label={
                    expanded ? "Collapse row" : "Expand row"
                  }
                >
                  {expanded ? "−" : "+"}
                </Button>
              ),

              expandedRowKeys: expandedPartnerIds,
              expandedRowRender: (record) => (
                <ExpandedProgramsRow
                  programs={(record.programs ?? []) as unknown as PartnerProgramRow[]}
                  columns={partnerProgramColumns}
                />
              ),
              onExpand: (expanded, record) => {
                setExpandedPartnerIds((prev) =>
                  expanded
                    ? [...prev, record.Id]
                    : prev.filter((id) => id !== record.Id)
                );
              },
            }}
          />
        </div>
      </div>

      {/* Delete Program Confirmation Modal */}
      <Modal
        open={!!deletingProgram}
        onCancel={() => setDeletingProgram(null)}
        onOk={handleDeleteProgram}
        title={<span className="text-base font-semibold text-slate-900">Delete Program</span>}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: deleteProgramLoading }}
        variant="compact"
        width="min(480px, 96vw)"
      >
        <p className="text-slate-600">
          Are you sure you want to delete <strong>{deletingProgram?.partnerProgramName}</strong>? This will also remove any associated forms.
        </p>
      </Modal>

      {/* Form Preview Modal */}
      <FormPreviewModal
        open={!!viewFormProgram}
        program={viewFormProgram}
        onClose={() => setViewFormProgram(null)}
        onDeleted={() => setViewFormProgram(null)}
      />
    </section>
  );
}
