"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { message } from "antd";
import { useGetPartnersQuery } from "@/store/services";
import { TopBar, ProgramTabs, ProgramFormRenderer } from "@/components/dealregAI";
import type { SelectedProgram } from "@/components/dealregAI"

function DetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: partnersData } = useGetPartnersQuery({ page: 1, limit: 100 });

  const [activeProgramId, setActiveProgramId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const formRef = useRef<any>(null);
  const initializedRef = useRef(false);

  const opportunityId = Number(searchParams.get("opportunityId")) || null;

  const programs: SelectedProgram[] = (partnersData?.partners ?? [])
    .filter((partner) => partner.Id === opportunityId)
    .flatMap((partner) =>
      (partner.programs ?? [])
        .filter((prog) => prog.formStatus === "SUBMITTED")
        .map((prog) => ({
          partnerId: partner.Id,
          programId: prog.id,
          partnerName: partner["partner Name"] || "-",
          programName: prog.partnerProgramName || "-",
        }))
    );

  useEffect(() => {
    if (initializedRef.current || programs.length === 0) return;
    const currentId = Number(searchParams.get("current")) || programs[0]?.programId;
    setActiveProgramId(currentId);
    initializedRef.current = true;
  }, [searchParams, programs]);

  const activeProgram = programs.find((p) => p.programId === activeProgramId) ?? programs[0] ?? null;

  // Get client form URL from partner data
  const partnerUrl = (partnersData?.partners ?? []).find((p) => p.Id === opportunityId)?.url || null;

  const handleSelectProgram = useCallback((programId: number) => {
    setActiveProgramId(programId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("id",String(Date.now()));
    params.set("current", String(programId));
    params.set("programIds", String(programId));
    router.push(`/dealRegAi/detail?${params.toString()}`);
  }, [searchParams, router]);

  const handleSubmit = () => formRef.current?.submit();
  const handleReset = () => {
    formRef.current?.resetFields();
    message.info("Form has been reset");
  };
  const handleSave = () => {
    if (formLoading) return;
    const values = formRef.current?.getFieldsValue();
    console.log("Program ID:", activeProgram?.programId);
    console.log("Saved Data:", JSON.stringify(values, null, 2));
    message.success("Draft saved successfully");
  };

  // Poll submitting state from form ref
  useEffect(() => {
    const interval = setInterval(() => {
      const isSubmitting = formRef.current?.__submitting ?? false;
      setFormLoading(isSubmitting);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full space-y-4 px-2 sm:px-4 lg:px-6">
      <TopBar
        partnerName={activeProgram?.partnerName ?? "Detail"}
        onReset={handleReset}
        onSubmit={handleSubmit}
        onSave={handleSave}
        loading={formLoading}
      />

      <ProgramTabs
        programs={programs}
        activeProgramId={activeProgramId}
        partnerName={activeProgram?.partnerName ?? "Registration"}
        onSelect={handleSelectProgram}
      />

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        {programs.length > 0 ? (
          programs.map((prog) => (
            <div key={prog.programId} style={{ display: activeProgramId === prog.programId ? "block" : "none" }}>
              <ProgramFormRenderer programId={prog.programId} partnerId={prog.partnerId} formRef={activeProgramId === prog.programId ? formRef : { current: null }} clientUrl={partnerUrl} />
            </div>
          ))
        ) : (
          <p className="text-slate-400 text-center py-12">No program selected.</p>
        )}
      </div>
    </section>
  );
}

export default function DealRegDetailPage() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-400">Loading...</div>}>
      <DetailContent />
    </Suspense>
  );
}
