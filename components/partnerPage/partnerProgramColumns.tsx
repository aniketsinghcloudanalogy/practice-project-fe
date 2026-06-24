"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LuPencil, LuTrash2, LuEye, LuPlus } from "react-icons/lu";

import Button from "@/components/common/Button";
import Switch from "@/components/common/Switch";
import { useUpdateVerificationStepMutation } from "@/store/services";
import type { PartnerProgramRow } from "./types";

function VerificationSwitch({ id, value, onToggle }: { id: number; value: boolean | null; onToggle: (checked: boolean) => void }) {
  const [checked, setChecked] = useState(value ?? false);
  const [updateVerificationStep, { isLoading: loading }] = useUpdateVerificationStepMutation();

  useEffect(() => { setChecked(value ?? false); }, [value]);

  const handleChange = async (next: boolean) => {
    const previousChecked = checked;
    setChecked(next);
    onToggle(next);
    
    try {
      await updateVerificationStep({ programId: id, verificationStep: next }).unwrap();
    } catch (error) {
      console.error('Failed to update verification step:', error);
      setChecked(previousChecked);
      onToggle(previousChecked);
    }
  };

  return <Switch variant="compact" checked={checked} loading={loading} onChange={handleChange} />;
}

function FormCell({
  record,
  onView,
  isSuperAdmin,
  isAdmin,
}: {
  record: PartnerProgramRow;
  onView?: (record: PartnerProgramRow) => void;
  isSuperAdmin?: boolean;
  isAdmin?: boolean;
}) {
  const router = useRouter();

  // No form exists
  if (!record.formStatus) {
    // Admin sees "No Form" (cannot create)
    if (isAdmin && !isSuperAdmin) {
      return (
        <span className="text-xs text-slate-400 italic">No Form</span>
      );
    }

    // Super admin can create — go to form builder
    if (isSuperAdmin) {
      return (
        <Button
          variant="secondary"
          aria-label="Create form"
          onClick={() => router.push(`/superAdminPartner/formBuilder?formid=${record.id}`)}
        >
          <LuPlus size={15} />
          <span className="ml-1 text-xs">Create</span>
        </Button>
      );
    }

    // Other roles — no form
    return <span className="text-xs text-slate-400 italic">No Form</span>;
  }

  // Form exists but is DRAFT — only super admin can see it
  if (record.formStatus === "DRAFT") {
    // Regular admin cannot see drafts - only submitted forms
    if (isAdmin && !isSuperAdmin) {
      return (
        <span className="text-xs text-slate-400 italic">No Form</span>
      );
    }

    // Super admin can see and edit drafts
    if (isSuperAdmin) {
      return (
        <Button
          variant="soft"
          aria-label="View draft form"
          onClick={() => onView?.(record)}
        >
          <LuEye size={15} />
          <span className="ml-1 text-xs">Draft</span>
        </Button>
      );
    }
  }

  // Form is SUBMITTED — both admin and super admin can view it
  if (record.formStatus === "SUBMITTED") {
    return (
      <Button
        variant="soft"
        aria-label="View submitted form"
        onClick={() => onView?.(record)}
      >
        <LuEye size={15} />
        <span className="ml-1 text-xs">View</span>
      </Button>
    );
  }

  // Fallback - shouldn't happen but just in case
  return <span className="text-xs text-slate-400 italic">No Form</span>;
}

export type ProgramAction = {
  onEdit?: (record: PartnerProgramRow) => void;
  onDelete?: (record: PartnerProgramRow) => void;
  onViewForm?: (record: PartnerProgramRow) => void;
};

export const getPartnerProgramColumns = (
  onToggle: (checked: boolean) => void,
  options?: { role?: string | null; userId?: string | null; actions?: ProgramAction }
) => {
  const isSuperAdmin = options?.role === "SUPER_ADMIN";
  const isAdmin = options?.role === "ADMIN";

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 90 },
    { title: "Partner Program Name", dataIndex: "partnerProgramName", key: "partnerProgramName", width: 220 },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 260,
      render: (value: string | null) => value ?? "-",
    },
    {
      title: "Verification Step",
      dataIndex: "verificationStep",
      key: "verificationStep",
      width: 160,
      render: (value: boolean | null, record: { id: number }) => (
        <VerificationSwitch id={record.id} value={value} onToggle={onToggle} />
      ),
    },
    {
      title: "Form",
      key: "form",
      width: 120,
      render: (_: unknown, record: PartnerProgramRow) => (
        <FormCell
          record={record}
          onView={options?.actions?.onViewForm}
          isSuperAdmin={isSuperAdmin}
          isAdmin={isAdmin}
        />
      ),
    },
  ];

  // Super admin gets edit/delete actions on programs
  if (isSuperAdmin && options?.actions) {
    columns.push({
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_: unknown, record: PartnerProgramRow) => (
        <div className="flex items-center gap-2">
          {options.actions?.onEdit && (
            <Button variant="soft" aria-label="Edit program" onClick={() => options.actions!.onEdit!(record)}>
              <LuPencil size={14} />
            </Button>
          )}
          {options.actions?.onDelete && (
            <Button variant="soft" aria-label="Delete program" onClick={() => options.actions!.onDelete!(record)}>
              <LuTrash2 size={14} className="text-red-600" />
            </Button>
          )}
        </div>
      ),
    } as typeof columns[number]);
  }

  return columns;
};
