"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import message from "@/components/common/Message";
import { StyledPdfPage } from "@/components/pdf/PdfPage.styles";
import {
  useDeletePdfTableMutation,
  useGetUserPdfsQuery,
  useUploadPdfMutation,
} from "@/store/services/pdf/apiSlice";
import type { InputRef } from "@/components/common/antd/Input";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "string") return error;

  if (error && typeof error === "object") {
    const maybeError = error as { message?: unknown; data?: { message?: unknown } };

    if (typeof maybeError.data?.message === "string") {
      return maybeError.data.message;
    }

    if (typeof maybeError.message === "string") {
      return maybeError.message;
    }
  }

  return fallback;
};

const Page = () => {
  const router = useRouter();
  const fileInputRef = useRef<InputRef | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const {
    data: pdfs = [],
    isLoading: listLoading,
    error,
  } = useGetUserPdfsQuery();
  const showInitialLoading = listLoading && pdfs.length === 0;
  const [uploadPdf, { isLoading: uploading }] = useUploadPdfMutation();
  const [deletePdfTable] = useDeletePdfTableMutation();
  const extractedTableCount = pdfs.length;

  const latestUploadLabel = pdfs[0]
    ? `${pdfs[0].title || pdfs[0].sourceFileName || "Untitled table"} • ${new Date(pdfs[0].createdAt ?? Date.now()).toLocaleString()}`
    : "No tables yet";

  useEffect(() => {
    if (error) {
      messageApi.error('Failed to fetch PDFs');
    }
  }, [error, messageApi]);

  const handleFile = async (f?: File) => {
    if (!f) return;
    try {
      const res = await uploadPdf(f).unwrap();
      const summary = res?.data;
      const summaryText = summary
        ? `${summary.insertedTables} tables added, ${summary.duplicateTables} duplicate tables skipped, ${summary.insertedRows} rows inserted.`
        : "PDF extracted successfully";

      messageApi.success(res?.message ? `${res.message} ${summaryText}` : summaryText);
    } catch (err: unknown) {
      messageApi.error(getErrorMessage(err, "Failed to upload PDF"));
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      messageApi.error("Only PDF files are allowed");
      return;
    }
    if (file.size > 1 * 1024 * 1024) {
      messageApi.error("PDF file size must not exceed 1MB");
      return;
    }
    handleFile(file);
    e.currentTarget.value = "";
  };

  const openFilePicker = () => {
    fileInputRef.current?.input?.click();
  };

  const handleView = (id: string) => {
    router.push(`/pdf/${id}`);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await deletePdfTable(id).unwrap();
      messageApi.success(res?.message ?? "Table deleted successfully");
    } catch (err: unknown) {
      messageApi.error(getErrorMessage(err, "Failed to delete table"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <StyledPdfPage className="mx-auto max-w-7xl px-6 py-6">
      {contextHolder}
      <section className="overflow-hidden rounded-4xl border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="grid gap-6 p-6 md:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-4">
            <p className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
              Extraction Status
            </p>
            <div className="space-y-3">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">All extracted tables in one place</h2>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                Upload PDFs to keep adding extracted tables. Use the button on the right to open the merged tables screen for the current user.
                The source filename list has been removed so the interface stays focused on extraction status.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Uploads</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{pdfs.length}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Extracted tables</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{extractedTableCount}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Latest upload</p>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-950">{latestUploadLabel}</p>
              </div>
            </div>
          </div>

              {/* right column intentionally left empty; upload card moved below for full-width layout */}
        </div>
      </section>


      <section className="mt-6 w-full rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Upload PDF</p>
        <h3 className="mt-2 text-xl font-semibold text-slate-950">Add more extracted tables</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">Only PDF files up to 1MB are accepted.</p>
        <section className="pdf-page-hero bg-linear-to-b from-white to-slate-50 p-8 rounded-2xl border border-slate-100 mt-4">
          <div className="pdf-page-hero__inner flex flex-col md:flex-row items-start gap-8">
            <div className="flex-1 pr-6">
              <p className="pdf-page-kicker text-xs uppercase tracking-wider text-slate-400">Document Intelligence</p>
              <h2 className="pdf-page-title text-2xl font-bold mt-2">PDF Extraction</h2>
              <p className="pdf-page-copy mt-2 text-sm text-slate-600">
                Upload a PDF to extract structured rows, browse saved tables, and open the merged table view for grouped schemas.
              </p>
            </div>

            <div className="pdf-upload-card bg-white rounded-xl p-5 shadow-sm border border-slate-100 w-full md:w-1/3">
              <p className="pdf-upload-card__label text-xs uppercase tracking-wider text-slate-400">Upload</p>
              <h3 className="pdf-upload-card__title font-semibold mt-2">Add a new PDF</h3>
              <p className="pdf-upload-card__copy text-sm text-slate-500">Only PDF files up to 1MB are accepted.</p>
              <Input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={onFileChange}
                className="hidden"
                style={{ display: "none" }}
              />
              <div className="mt-5 flex flex-col gap-3">
                <Button type="primary" loading={uploading} onClick={openFilePicker} className="w-full">
                  Upload PDF
                </Button>
                <Button type="default" onClick={() => router.push('/pdf/merged')} className="w-full">
                  Show Extracted Tables
                </Button>
              </div>
            </div>
          </div>
        </section>
      </section>

    </StyledPdfPage>
  );
};

export default Page;