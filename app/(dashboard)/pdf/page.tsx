"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import Table from "@/components/common/Table";
import message from "@/components/common/Message";
import { StyledPdfDetailsPage } from "@/components/pdf/PdfDetails.styles";
import { useGetMergedExtractedDataQuery } from "@/store/services/pdf/apiSlice";
import type { PdfColumn } from "@/store/services/types";

const renderCell = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return <span className="text-slate-400">-</span>;
  }

  if (typeof value === "number") {
    return <span className="font-medium text-slate-900">{value.toLocaleString()}</span>;
  }

  return <span className="text-slate-700">{String(value)}</span>;
};

const buildColumns = (columns: PdfColumn[]) => {
  return columns.map((column) => ({
    title: column.title,
    dataIndex: column.key,
    key: column.key,
    render: renderCell,
  }));
};

const formatSourceName = (sourceName: string) => {
  return sourceName
    .replace(/\.pdf$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const getDisplayTableTitle = (title: string | null | undefined, sourceFileNames: string[]) => {
  const normalizedTitle = typeof title === "string" ? title.trim() : "";
  const genericTableTitlePattern = /^table\s+\d+$/i;

  if (normalizedTitle && !genericTableTitlePattern.test(normalizedTitle)) {
    return normalizedTitle;
  }

  const sourceFileName = sourceFileNames.find((name) => typeof name === "string" && name.trim().length > 0);
  return sourceFileName ? formatSourceName(sourceFileName) : "Untitled table";
};

const MergedTablesPage = () => {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  const { data, isLoading, error } = useGetMergedExtractedDataQuery();

  React.useEffect(() => {
    if (error) {
      messageApi.error("Failed to fetch extracted tables");
    }
  }, [error, messageApi]);

  return (
    <StyledPdfDetailsPage className="mx-auto max-w-7xl px-6 py-6">
      {contextHolder}
      <div className="pdf-detail-layout">
        <div className="pdf-detail-topbar">
          <div>
            <h1 className="pdf-section-title text-3xl">Merged extracted tables</h1>
            <p className="pdf-section-copy">All extracted tables for the current user are shown below, grouped by table schema.</p>
          </div>
          <div className="pdf-detail-actions">
            <Button onClick={() => router.push('/pdf')}>
              Back
            </Button>
          </div>
        </div>

        <div className="pdf-section-card">
          <div className="pdf-section-header">
            <div>
              <h2 className="pdf-section-title">All tables</h2>
              <p className="pdf-section-copy">This view merges same-structure tables and shows every row extracted from uploaded PDFs.</p>
            </div>
          </div>

          <div className="p-5 md:p-6">
            {isLoading ? (
              <div className="grid gap-4">
                <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
                <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
              </div>
            ) : !data?.tables?.length ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                <p className="text-lg font-medium text-slate-900">No extracted tables yet</p>
                <p className="mt-2 text-sm text-slate-500">Upload a PDF to populate this merged table view.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {data.tables.map((table, index) => {
                  const tableColumns = buildColumns(table.columns);
                  const sourceTableId = table.sourceTableIds?.[0];
                  const displayTitle = getDisplayTableTitle(table.title, table.sourceFileNames ?? []);

                  return (
                    <section key={`${table.schemaHash}-${index}`} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Table {index + 1}</p>
                          <h3 className="mt-1 text-lg font-semibold text-slate-950">{displayTitle}</h3>
                          <p className="mt-1 text-xs text-slate-500">
                            {table.sourceTableIds.length} source table{table.sourceTableIds.length === 1 ? "" : "s"}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="pdf-status-chip">{table.rows.length} rows</div>
                          <Button
                            onClick={() => sourceTableId && router.push(`/pdf/${sourceTableId}`)}
                            disabled={!sourceTableId}
                          >
                            Edit rows / clear table
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 md:p-5">
                        <Table
                          rowKey="key"
                          columns={tableColumns}
                          dataSource={table.rows.map((row, rowIndex) => ({
                            ...row,
                            key: row.id ?? `${table.schemaHash}-${rowIndex}`,
                          }))}
                          pagination={false}
                        />
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </StyledPdfDetailsPage>
  );
};

export default MergedTablesPage;