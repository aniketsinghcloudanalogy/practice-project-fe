"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

import Modal from "@/components/common/Modal";
import {
  EditPartnerDrawer,
  PartnerModals,
  PartnerStats,
  PartnerTable,
} from "@/components/partnerPage";
import type { ModalType, PartnerFormValues } from "@/components/partnerPage";
import { useGetPartnersQuery, useDeletePartnerMutation, type PartnerRow } from "@/store/services";

export default function SuperAdminPartner() {
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

  const { data, isLoading: loading, refetch: refetchPartners } = useGetPartnersQuery({ page, limit, search: debouncedSearch });
  const [deletePartner, { isLoading: deleteLoading }] = useDeletePartnerMutation();

  const partners = data?.partners ?? [];
  const total = data?.total ?? 0;

  const totalPrograms = partners.reduce((sum, p) => sum + (p.programs?.length ?? 0), 0);
  const pending = partners.reduce((sum, p) => sum + (p.programs?.filter((prog: any) => !prog.verificationStep).length ?? 0), 0);
  
  const [programsRefreshKey, setProgramsRefreshKey] = useState(0);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingPartner, setEditingPartner] = useState<PartnerRow | null>(null);
  const [deletingPartner, setDeletingPartner] = useState<PartnerRow | null>(null);
  const [programPartnerName, setProgramPartnerName] = useState<string | undefined>();

  const closeModal = () => {
    setModalType(null);
    setEditingPartner(null);
  };

  const handleEditPartnerSubmit = (values: PartnerFormValues) => {
    if (!editingPartner) return;
    refetchPartners();
    closeModal();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPartner) return;
    try {
      await deletePartner(deletingPartner.Id).unwrap();
      setDeletingPartner(null);
    } catch (error) {
      console.error('Failed to delete partner:', error);
      setDeletingPartner(null);
    }
  };

  const partnerNameOptions = partners.map((p) => ({
    label: `(Id : ${p.Id}) - ${p["partner Name"]} `,
    value: p["partner Name"] ?? "",
  }));

  return (
    <div className="w-full space-y-6 px-2 sm:px-4 lg:px-6">
      <PartnerStats partnerCount={total} totalPrograms={totalPrograms} pending={pending} />

      <PartnerTable
        loading={loading}
        dataSource={partners}
        role={role}
        userId={session?.user?.id ?? null}
        onEdit={(record) => { setEditingPartner(record); setModalType("edit-partner"); }}
        onDelete={(record) => setDeletingPartner(record)}
        onAddPartner={() => setModalType("partner")}
        onAddProgram={(name) => { setProgramPartnerName(name); setModalType("program"); }}
        programsRefreshKey={programsRefreshKey}
        onVerificationToggle={() => {}}
        pagination={{ page, limit, total }}
        onPageChange={setPage}
        onLimitChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
      />

      <PartnerModals
        modalType={modalType}
        partnerNameOptions={partnerNameOptions}
        defaultPartnerName={programPartnerName}
        onClose={() => { closeModal(); setProgramPartnerName(undefined); }}
        onPartnerSubmit={(newPartner) => { refetchPartners(); closeModal(); }}
        onProgramSubmit={() => { setProgramsRefreshKey((k) => k + 1); refetchPartners(); closeModal(); setProgramPartnerName(undefined); }}
      />

      <EditPartnerDrawer
        open={modalType === "edit-partner"}
        partner={editingPartner}
        onClose={closeModal}
        onSubmit={handleEditPartnerSubmit}
      />

      <Modal
        open={!!deletingPartner}
        onCancel={() => setDeletingPartner(null)}
        onOk={handleDeleteConfirm}
        title={<span className="text-base font-semibold text-slate-900">Delete Partner</span>}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: deleteLoading }}
        variant="compact"
        width="min(480px, 96vw)"
      >
        <p className="text-slate-600">
          Are you sure you want to delete <strong>{deletingPartner?.["partner Name"]}</strong>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
