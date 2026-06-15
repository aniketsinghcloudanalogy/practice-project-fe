"use client";

import { useEffect, useState } from "react";

import Modal from "@/components/common/Modal";
import {
  EditPartnerDrawer,
  PartnerModals,
  PartnerStats,
  PartnerTable,
} from "@/components/partnerPage";
import type { ModalType, PartnerFormValues, PartnerRow } from "@/components/partnerPage";
import { deletePartner, getPartners, getPartnerStats } from "@/lib/api/partner.api";

export default function SuperAdminPartner() {
  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [partnerCount, setPartnerCount] = useState(0);
  const [totalPrograms, setTotalPrograms] = useState(0);
  const [pending, setPending] = useState(0);
  const [programsRefreshKey, setProgramsRefreshKey] = useState(0);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingPartner, setEditingPartner] = useState<PartnerRow | null>(null);
  const [deletingPartner, setDeletingPartner] = useState<PartnerRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true);
        const [partnersRes, statsRes] = await Promise.all([getPartners(), getPartnerStats()]);
        if (partnersRes?.success) setPartners(partnersRes.data ?? []);
        if (statsRes?.success) {
          setPartnerCount(statsRes.data?.totalPartners ?? 0);
          setTotalPrograms(statsRes.data?.totalPrograms ?? 0);
          setPending(statsRes.data?.pending ?? 0);
        }
      } catch (error) {
        console.error("Error fetching partners:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPartners();
  }, []);

  const closeModal = () => {
    setModalType(null);
    setEditingPartner(null);
  };

  const handleEditPartnerSubmit = (values: PartnerFormValues) => {
    if (!editingPartner) return;
    setPartners((prev) =>
      prev.map((p) => (p.id === editingPartner.id ? { ...p, ...values } : p))
    );
    closeModal();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPartner) return;
    try {
      setDeleteLoading(true);
      await deletePartner(deletingPartner.id);
      setPartners((prev) => prev.filter((p) => p.id !== deletingPartner.id));
      setPartnerCount((c) => c - 1);
      setDeletingPartner(null);
    } catch {
      setDeletingPartner(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const partnerNameOptions = partners.map((p) => ({
    label: `(Id : ${p.id}) - ${p.partnerName} `,
    value: p.partnerName ?? "",
  }));

  return (
    <div className="w-full space-y-6 px-2 sm:px-4 lg:px-6">
      <PartnerStats partnerCount={partnerCount} totalPrograms={totalPrograms} pending={pending} />

      <PartnerTable
        loading={loading}
        dataSource={partners}
        onEdit={(record) => { setEditingPartner(record); setModalType("edit-partner"); }}
        onDelete={(record) => setDeletingPartner(record)}
        onAddPartner={() => setModalType("partner")}
        onAddProgram={() => setModalType("program")}
        programsRefreshKey={programsRefreshKey}
        onVerificationToggle={(checked) => setPending((c) => checked ? Math.max(0, c - 1) : c + 1)}
      />

      <PartnerModals
        modalType={modalType}
        partnerNameOptions={partnerNameOptions}
        onClose={closeModal}
        onPartnerSubmit={(newPartner) => { setPartners((prev) => [newPartner, ...prev]); setPartnerCount((c) => c + 1); closeModal(); }}
        onProgramSubmit={() => { setProgramsRefreshKey((k) => k + 1); setTotalPrograms((c) => c + 1); setPending((c) => c + 1); closeModal(); }}
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
          Are you sure you want to delete <strong>{deletingPartner?.partnerName}</strong>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
