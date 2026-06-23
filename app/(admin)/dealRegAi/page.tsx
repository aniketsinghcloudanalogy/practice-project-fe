"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import { LuSearch, LuPlus, LuChevronDown, LuChevronUp, LuTrash2 } from "react-icons/lu";
import { HiOutlineDocumentText } from "react-icons/hi2";
import { MdOutlineTrendingUp, MdOutlineAccessTime, MdOutlineCheckCircle } from "react-icons/md";
import type { ColumnsType } from "antd/es/table";

import Button from "@/components/common/antd/Button";
import Input from "@/components/common/Input";
import Table from "@/components/common/Table";
import Modal from "@/components/common/Modal";
import Select from "@/components/common/Select";
import { useGetPartnersQuery } from "@/store/services";

const TABS = ["All", "New", "In Progress", "Submitted", "Approved", "Rejected", "Expired"] as const;
type Tab = (typeof TABS)[number];
const STORAGE_KEY = "dealregai_active_tab";

type DealRow = {
  id: number;
  partnerName: string;
  programName: string;
  submittedCount: number;
  status: string;
};

export default function DealRegAiPage() {
  const router = useRouter();
  const { data: partnersData, isLoading } = useGetPartnersQuery({ page: 1, limit: 1000 });
  const [showRegModal, setShowRegModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState({ registered: true, selfRegistered: true });
  const [regRows, setRegRows] = useState<{ partnerId: number | null; programId: number | null }[]>([]);
  const [selfRegRows, setSelfRegRows] = useState<{ partnerId: number | null; programId: number | null }[]>([]);

  // Count from partner programs (form designs)
  const allPrograms = (partnersData?.partners ?? []).flatMap((p) => p.programs ?? []);
  const totalFormsCount = allPrograms.length;
  const submittedFormsCount = allPrograms.filter((p) => p.formStatus === "SUBMITTED").length;
  const inProgressCount = allPrograms.filter((p) => p.formStatus === "DRAFT").length;

  // Table: one row per partner that has at least one submitted form
  const tableData: DealRow[] = (partnersData?.partners ?? [])
    .filter((partner) => (partner.programs ?? []).some((prog) => prog.formStatus === "SUBMITTED"))
    .map((partner) => {
      const submittedPrograms = (partner.programs ?? []).filter((p) => p.formStatus === "SUBMITTED");
      return {
        id: partner.Id,
        partnerName: partner["partner Name"] || "-",
        programName: submittedPrograms.map((p) => p.partnerProgramName).join(", ") || "-",
        submittedCount: submittedPrograms.length,
        status: "Submitted",
      };
    });

  const stats = [
    {
      icon: <HiOutlineDocumentText size={24} className="text-slate-600" />,
      bg: "bg-slate-100",
      label: "Total Forms",
      value: totalFormsCount,
    },
    {
      icon: <MdOutlineTrendingUp size={24} className="text-blue-600" />,
      bg: "bg-blue-50",
      label: "Opportunity",
      value: submittedFormsCount,
    },
    {
      icon: <MdOutlineAccessTime size={24} className="text-amber-600" />,
      bg: "bg-amber-50",
      label: "In Progress",
      value: totalFormsCount - submittedFormsCount,
    },
    {
      icon: <MdOutlineCheckCircle size={24} className="text-green-600" />,
      bg: "bg-green-50",
      label: "Submitted",
      value: submittedFormsCount,
    },
  ];



  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [search, setSearch] = useState("");

  const filtered = tableData.filter((d) => {
    const matchTab = activeTab === "All" || d.status === activeTab;
    const matchSearch = !search.trim() || d.partnerName.toLowerCase().includes(search.trim().toLowerCase());
    return matchTab && matchSearch;
  });

  const columns: ColumnsType<DealRow> = [
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
      width: 80,
      align: "center",
      render: (v) => <span className="text-blue-600 font-medium">{v}</span>,
    },
    {
      title: "Opportunity",
      dataIndex: "partnerName",
      key: "partnerName",
      sorter: (a, b) => a.partnerName.localeCompare(b.partnerName),
      render: (v) => <span className="text-blue-600 font-medium">{v}</span>,
    },
    {
      title: "Total Forms",
      dataIndex: "submittedCount",
      key: "submittedCount",
      width: 120,
      align: "center",
      render: (v) => <span className="font-medium">{v}</span>,
    },
  ];

  return (
    <section className="w-full space-y-6 px-2 sm:px-4 lg:px-6">
      {/* Stats */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-6">
          {stats.map((stat, i) => (
            <Fragment key={stat.label}>
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bg}`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="m-0 text-2xl font-semibold text-slate-900">{stat.value}</p>
                  <p className="m-0 text-sm text-slate-500">{stat.label}</p>
                </div>
              </div>
              {i < stats.length - 1 && (
                <div className="hidden h-12 w-px bg-slate-200 lg:block" />
              )}
            </Fragment>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">All Registered Forms</h1>
        <Button variant="dashed" onClick={() => setShowRegModal(true)} style={{ height: 44, borderRadius: 24, fontWeight: 600, paddingInline: 24 }}>
          + New Registration
        </Button>
      </div>

      {/* Table section */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {/* Tabs + Search */}
        <div className="flex flex-col gap-4 px-6 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex gap-4 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Input
              appearance="soft"
              placeholder="Search here"
              allowClear
              prefix={<LuSearch size={15} className="text-slate-400" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 200, height: 40, borderRadius: 8 }}
            />
            <button
              onClick={() => { setSearch(""); setActiveTab("All"); }}
              className="text-sm text-slate-400 hover:text-slate-600"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto mt-2">
          <Table<DealRow>
            columns={[Table.EXPAND_COLUMN, ...columns]}
            dataSource={filtered}
            rowKey="id"
            loading={isLoading}
            pagination={{ pageSize: 5, showSizeChanger: true, size: "small" }}
            scroll={{ x: 600 }}
            size="middle"
            expandable={{
              expandIcon: ({ expanded, onExpand, record }) => (
                <Button
                  variant="soft"
                  shape="circle"
                  htmlType="button"
                  onClick={(e) => onExpand(record, e)}
                  aria-label={expanded ? "Collapse" : "Expand"}
                >
                  {expanded ? "−" : "+"}
                </Button>
              ),
              expandedRowRender: (record) => (
                <div className="p-4 text-sm text-slate-600">
                  Program: {record.programName}
                </div>
              ),
            }}
          />
        </div>
      </div>
      {/* New Registration Modal */}
      <Modal
        open={showRegModal}
        onCancel={() => setShowRegModal(false)}
        footer={null}
        closable={true}
        width="min(560px, 96vw)"
        title={null}
      >
        <div className="space-y-4">
          {/* Registered Partners */}
          <div className="border-b border-slate-200 pb-4">
            <button
              className="flex w-full items-center justify-between text-left"
              onClick={() => setExpandedSections((s) => ({ ...s, registered: !s.registered }))}
            >
              <h3 className="text-lg font-semibold text-slate-900">Registered Partners</h3>
              {expandedSections.registered ? <LuChevronUp size={20} /> : <LuChevronDown size={20} />}
            </button>
            {expandedSections.registered && (
              <div className="mt-3 space-y-3">
                {regRows.map((row, idx) => {
                  const selectedPartner = (partnersData?.partners ?? []).find((p) => p.Id === row.partnerId);
                  const programs = (selectedPartner?.programs ?? []).filter((p) => p.formStatus === "SUBMITTED");
                  return (
                    <div key={idx} className="flex items-end gap-3">
                      <div className="flex-1">
                        <p className="mb-1 text-xs text-slate-500">Partner</p>
                        <Select
                          style={{ width: "100%" }}
                          placeholder="Select partner"
                          value={row.partnerId}
                          onChange={(val) => {
                            const updated = [...regRows];
                            updated[idx] = { partnerId: val as number, programId: null };
                            setRegRows(updated);
                          }}
                          options={(partnersData?.partners ?? [])
                            .filter((p) => (p.programs ?? []).some((pr) => pr.formStatus === "SUBMITTED"))
                            .map((p) => ({ label: p["partner Name"] || "-", value: p.Id }))}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="mb-1 text-xs text-slate-500">Partner Program</p>
                        <Select
                          style={{ width: "100%" }}
                          placeholder="Select program"
                          value={row.programId}
                          onChange={(val) => {
                            const updated = [...regRows];
                            updated[idx] = { ...updated[idx], programId: val as number };
                            setRegRows(updated);
                          }}
                          options={programs.map((p) => ({ label: p.partnerProgramName || "-", value: p.id }))}
                        />
                      </div>
                      <button
                        className="mb-1 text-red-500 hover:text-red-700"
                        onClick={() => setRegRows((r) => r.filter((_, i) => i !== idx))}
                      >
                        <LuTrash2 size={18} />
                      </button>
                    </div>
                  );
                })}
                <button
                  className="flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700"
                  onClick={() => setRegRows((r) => [...r, { partnerId: null, programId: null }])}
                >
                  <LuPlus size={18} />
                  Add Partner and Partner Program
                </button>
              </div>
            )}
          </div>

          {/* Self Registered Partners */}
          <div className="pb-4">
            <button
              className="flex w-full items-center justify-between text-left"
              onClick={() => setExpandedSections((s) => ({ ...s, selfRegistered: !s.selfRegistered }))}
            >
              <h3 className="text-lg font-semibold text-slate-900">Self Registered Partners</h3>
              {expandedSections.selfRegistered ? <LuChevronUp size={20} /> : <LuChevronDown size={20} />}
            </button>
            {expandedSections.selfRegistered && (
              <div className="mt-3 space-y-3">
                {selfRegRows.map((row, idx) => {
                  const selectedPartner = (partnersData?.partners ?? []).find((p) => p.Id === row.partnerId);
                  const programs = (selectedPartner?.programs ?? []).filter((p) => p.formStatus === "SUBMITTED");
                  return (
                    <div key={idx} className="flex items-end gap-3">
                      <div className="flex-1">
                        <p className="mb-1 text-xs text-slate-500">Partner</p>
                        <Select
                          style={{ width: "100%" }}
                          placeholder="Select partner"
                          value={row.partnerId}
                          onChange={(val) => {
                            const updated = [...selfRegRows];
                            updated[idx] = { partnerId: val as number, programId: null };
                            setSelfRegRows(updated);
                          }}
                          options={(partnersData?.partners ?? [])
                            .filter((p) => (p.programs ?? []).some((pr) => pr.formStatus === "SUBMITTED"))
                            .map((p) => ({ label: p["partner Name"] || "-", value: p.Id }))}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="mb-1 text-xs text-slate-500">Partner Program</p>
                        <Select
                          style={{ width: "100%" }}
                          placeholder="Select program"
                          value={row.programId}
                          onChange={(val) => {
                            const updated = [...selfRegRows];
                            updated[idx] = { ...updated[idx], programId: val as number };
                            setSelfRegRows(updated);
                          }}
                          options={programs.map((p) => ({ label: p.partnerProgramName || "-", value: p.id }))}
                        />
                      </div>
                      <button
                        className="mb-1 text-red-500 hover:text-red-700"
                        onClick={() => setSelfRegRows((r) => r.filter((_, i) => i !== idx))}
                      >
                        <LuTrash2 size={18} />
                      </button>
                    </div>
                  );
                })}
                <button
                  className="flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700"
                  onClick={() => setSelfRegRows((r) => [...r, { partnerId: null, programId: null }])}
                >
                  <LuPlus size={18} />
                  Add Partner and Partner Program
                </button>
              </div>
            )}
          </div>

          {/* Save & Next */}
          <div className="flex justify-center pt-2">
            <Button
              variant="primary"
              style={{ height: 44, borderRadius: 24, fontWeight: 600, paddingInline: 32 }}
              onClick={() => {
                const allSelected = [...regRows, ...selfRegRows].filter((r) => r.programId);
                if (allSelected.length === 0) return;
                const programIds = allSelected.map((r) => r.programId).join(",");
                const firstPartner = allSelected[0];
                setShowRegModal(false);
                router.push(`/dealRegAi/detail?id=${Date.now()}&opportunityId=${firstPartner.partnerId}&programIds=${programIds}&current=${firstPartner.programId}`);
              }}
            >
              Save & Next
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
