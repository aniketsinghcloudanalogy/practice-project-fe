"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

import {
  PartnerStats,
  PartnerTable,
} from "@/components/partnerPage";
import { useGetPartnersQuery } from "@/store/services";

export default function AdminPartnerPage() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? null;

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading: loading } = useGetPartnersQuery({ page, limit, search: debouncedSearch });

  const partners = data?.partners ?? [];
  const total = data?.total ?? 0;

  const totalPrograms = partners.reduce((sum, p) => sum + (p.programs?.length ?? 0), 0);
  const pending = partners.reduce((sum, p) => sum + (p.programs?.filter((prog: any) => !prog.verificationStep).length ?? 0), 0);

  return (
    <div className="w-full space-y-6 px-2 sm:px-4 lg:px-6">
      <PartnerStats partnerCount={total} totalPrograms={totalPrograms} pending={pending} />

      <PartnerTable
        loading={loading}
        dataSource={partners}
        role={role}
        userId={session?.user?.id ?? null}
        onEdit={() => {}}
        onDelete={() => {}}
        onAddPartner={() => {}}
        onAddProgram={() => {}}
        programsRefreshKey={0}
        onVerificationToggle={() => {}}
        pagination={{ page, limit, total }}
        onPageChange={setPage}
        onLimitChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
      />
    </div>
  );
}
