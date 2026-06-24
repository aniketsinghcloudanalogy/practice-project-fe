"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LuPencil, LuTrash2 } from "react-icons/lu";

import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import { useGetProgramFormQuery, useDeleteProgramFormMutation } from "@/store/services";
import type { ProgramForm } from "@/store/services";
import type { FormSchema } from "@/components/formBuilder/types";
import FormPreviewRenderer from "./FormPreviewRenderer";
import type { PartnerProgramRow } from "./types";

type Props = {
  open: boolean;
  program: PartnerProgramRow | null;
  onClose: () => void;
  onDeleted?: () => void;
};

export default function FormPreviewModal({ open, program, onClose, onDeleted }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const role = session?.user?.role ?? "";
  const isSuperAdmin = role === "SUPER_ADMIN";

  const { data: formData, isLoading: loading, refetch } = useGetProgramFormQuery(program?.id!, {
    skip: !open || !program,
  });
  const [deleteProgramForm, { isLoading: deleting }] = useDeleteProgramFormMutation();

  // Refetch when modal opens
  useEffect(() => {
    if (open && program) {
      refetch();
    }
  }, [open, program, refetch]);

  const isSubmitted = formData?.status === "SUBMITTED";

  // Super admin can edit and delete
  const canEdit = isSuperAdmin;
  const canDelete = isSuperAdmin;

  const handleEdit = () => {
    if (!program) return;
    onClose();
    router.push(`/superAdminPartner/formBuilder?formid=${program.id}`);
  };

  const handleDelete = async () => {
    if (!formData || !program) return;
    if (!window.confirm("Are you sure you want to delete this form? This cannot be undone.")) return;
    
    try {
      await deleteProgramForm(program.id).unwrap();
      onDeleted?.();
      onClose();
    } catch (error) {
      console.error('Failed to delete program form:', error);
    }
  };

  // Get the form schema from the stored data
  const getFormSchema = (): FormSchema | null => {
    if (!formData) return null;
    const data = isSubmitted ? formData.submittedDesign : formData.formDesign;
    if (!data) return null;
    return data as unknown as FormSchema;
  };

  const schema = getFormSchema();

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div className="flex items-center justify-between pr-8">
          <span className="text-base font-semibold text-slate-900">
            Form Preview — {program?.partnerProgramName}
          </span>
        </div>
      }
      footer={null}
      width="min(860px, 96vw)"
      styles={{ body: { maxHeight: "78vh", overflowY: "auto", padding: "16px 24px" } }}
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <span className="text-slate-400 text-sm">Loading form…</span>
        </div>
      ) : !formData ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <span className="text-slate-400 text-sm">No form found for this program.</span>
          {isSuperAdmin && (
            <Button variant="secondary" onClick={handleEdit}>
              <LuPencil size={14} />
              <span className="ml-1">Create Form</span>
            </Button>
          )}
        </div>
      ) : !schema ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <span className="text-slate-400 text-sm">No form data available.</span>
        </div>
      ) : (
        <>
          <FormPreviewRenderer schema={schema} />

          {/* Action bar — only super admin gets Edit and Delete */}
          {isSuperAdmin && (
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              {canEdit && (
                <Button variant="secondary" onClick={handleEdit}>
                  <LuPencil size={14} />
                  <span className="ml-1 text-xs">Edit</span>
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="soft"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <LuTrash2 size={14} className="text-red-600" />
                  <span className="ml-1 text-xs text-red-600">{deleting ? "Deleting…" : "Delete"}</span>
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
