"use client";

import { useState, useEffect, Fragment } from "react";
import { LuSearch } from "react-icons/lu";
import { HiOutlineDocumentText } from "react-icons/hi2";
import { MdOutlineTrendingUp, MdOutlineAccessTime, MdOutlineCheckCircle } from "react-icons/md";
import type { ColumnsType } from "antd/es/table";

import Button from "@/components/common/antd/Button";
import Input from "@/components/common/Input";
import Table from "@/components/common/Table";

const TABS = ["All", "New", "In Progress", "Submitted", "Approved", "Rejected", "Expired"] as const;
type Tab = (typeof TABS)[number];
const STORAGE_KEY = "dealregai_active_tab";

type DealRow = {
  id: number;
  opportunity: string;
  status: Tab;
};

// Mock data
const mockDeals: DealRow[] = [
  { id: 253, opportunity: "New 2", status: "New" },
  { id: 250, opportunity: "New", status: "New" },
  { id: 240, opportunity: "Seliant - Tech Refresh", status: "In Progress" },
  { id: 237, opportunity: "Demo Opportunity", status: "Submitted" },
];

const stats = [
  {
    icon: <HiOutlineDocumentText size={24} className="text-slate-600" />,
    bg: "bg-slate-100",
    label: "Total Forms",
    value: 10,
  },
  {
    icon: <MdOutlineTrendingUp size={24} className="text-blue-600" />,
    bg: "bg-blue-50",
    label: "Opportunity",
    value: 4,
  },
  {
    icon: <MdOutlineAccessTime size={24} className="text-amber-600" />,
    bg: "bg-amber-50",
    label: "In Progress",
    value: 0,
  },
  {
    icon: <MdOutlineCheckCircle size={24} className="text-green-600" />,
    bg: "bg-green-50",
    label: "Submitted",
    value: 0,
  },
];

export default function DealRegAiPage() {
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY) as Tab | null;
      if (saved && (TABS as readonly string[]).includes(saved)) return saved;
    }
    return "All";
  });

  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, activeTab);
  }, [activeTab]);

  const filtered = mockDeals.filter((d) => {
    const matchTab = activeTab === "All" || d.status === activeTab;
    const matchSearch = !search.trim() || d.opportunity.toLowerCase().includes(search.trim().toLowerCase());
    return matchTab && matchSearch;
  });

  const columns: ColumnsType<DealRow> = [
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
      width: 200,
      sorter: (a, b) => a.id - b.id,
      render: (v) => <span className="text-blue-600 font-medium">{v}</span>,
    },
    {
      title: "Opportunity",
      dataIndex: "opportunity",
      key: "opportunity",
      sorter: (a, b) => a.opportunity.localeCompare(b.opportunity),
      render: (v) => <span className="text-blue-600 font-medium">{v}</span>,
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
        <Button variant="primary" style={{ height: 44, borderRadius: 24, fontWeight: 600, paddingInline: 24 }}>
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
                  Details for deal #{record.id} — {record.opportunity}
                </div>
              ),
            }}
          />
        </div>
      </div>
    </section>
  );
}
