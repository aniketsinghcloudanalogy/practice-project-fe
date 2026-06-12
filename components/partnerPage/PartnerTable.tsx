import { useEffect, useRef, useState } from "react";
import { LuPencil, LuSearch, LuTrash2 } from "react-icons/lu";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Table from "@/components/common/Table";
import { getPartnerPrograms } from "@/lib/api/partner.api";

import { getPartnerProgramColumns } from "./partnerProgramColumns";
import type { PartnerProgramRow } from "./types";

export type PartnerRow = {
  id: number;
  externalId: string | null;
  partnerName: string;
  parentPartner: string | null;
  pmId: string | null;
  url: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
};

type PartnerTableProps = {
  loading: boolean;
  dataSource: PartnerRow[];
  onEdit: (record: PartnerRow) => void;
  onDelete: (record: PartnerRow) => void;
  onAddPartner: () => void;
  onAddProgram: () => void;
  programsRefreshKey?: number;
  onVerificationToggle: (checked: boolean) => void;
};

export default function PartnerTable({
  loading,
  dataSource,
  onEdit,
  onDelete,
  onAddPartner,
  onAddProgram,
  programsRefreshKey,
  onVerificationToggle,
}: PartnerTableProps) {
  const [programs, setPrograms] = useState<Record<number, PartnerProgramRow[]>>({});
  const [programsLoading, setProgramsLoading] = useState<Record<number, boolean>>({});
  const [search, setSearch] = useState("");
  const expandedKeysRef = useRef<Set<number>>(new Set());

  const loadPrograms = async (partnerId: number) => {
    setProgramsLoading((prev) => ({ ...prev, [partnerId]: true }));
    try {
      const res = await getPartnerPrograms(partnerId);
      if (res?.success) setPrograms((prev) => ({ ...prev, [partnerId]: res.data?.programs ?? [] }));
    } finally {
      setProgramsLoading((prev) => ({ ...prev, [partnerId]: false }));
    }
  };

  useEffect(() => {
    if (programsRefreshKey === 0) return;
    expandedKeysRef.current.forEach((id) => loadPrograms(id));
  }, [programsRefreshKey]);

  const partnerProgramColumns = getPartnerProgramColumns(onVerificationToggle);

  const filtered = search.trim()
    ? dataSource.filter((p) => {
        const q = search.trim().toLowerCase();
        return (
          p.partnerName.toLowerCase().includes(q) ||
          (p.email ?? "").toLowerCase().includes(q)
        );
      })
    : dataSource;

  const partnerColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 90,
    },
    {
      title: "External ID",
      dataIndex: "externalId",
      key: "externalId",
      width: 150,
      render: (value: string | null) => value ?? "-",
    },
    {
      title: "Partner Name",
      dataIndex: "partnerName",
      key: "partnerName",
      width: 200,
    },
    {
      title: "Parent Partner",
      dataIndex: "parentPartner",
      key: "parentPartner",
      width: 180,
      render: (value: string | null) => value ?? "-",
    },
    {
      title: "PM ID",
      dataIndex: "pmId",
      key: "pmId",
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
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_: unknown, record: PartnerRow) => (
        <div className="flex items-center gap-2">
          <Button
            variant="soft"
            aria-label="Edit partner"
            onClick={() => onEdit(record)}
          >
            <LuPencil size={16} />
          </Button>

          <Button
            variant="soft"
            aria-label="Delete partner"
            onClick={() => onDelete(record)}
          >
            <LuTrash2 size={16} className="text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  const columns = [Table.EXPAND_COLUMN, ...partnerColumns];

  return (
    <section className="mt-6">
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
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 260, height: 44, borderRadius: 8 }}
          />
          <Button variant="secondary" onClick={onAddPartner}>Add Partner</Button>
          <Button variant="secondary" onClick={onAddProgram}>Add Partner Program</Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="w-full overflow-x-auto">
          <Table<PartnerRow>
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 5,
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

              expandedRowRender: (record) => (
                <div className="bg-[#f8fbff] px-4 py-4 sm:px-5">
                  <Table<PartnerProgramRow>
                    variant="compact"
                    columns={partnerProgramColumns}
                    dataSource={programs[record.id] ?? []}
                    rowKey="id"
                    loading={programsLoading[record.id] ?? false}
                    pagination={false}
                    size="small"
                    scroll={{ x: 1100 }}
                  />
                </div>
              ),
              onExpand: (expanded, record) => {
                if (expanded) {
                  expandedKeysRef.current.add(record.id);
                  loadPrograms(record.id);
                } else {
                  expandedKeysRef.current.delete(record.id);
                }
              },
            }}
          />
        </div>
      </div>
    </section>
  );
}