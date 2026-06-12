"use client";

import { useEffect, useState } from "react";

import Switch from "@/components/common/Switch";
import { updateVerificationStep } from "@/lib/api/partner.api";

function VerificationSwitch({ id, value, onToggle }: { id: number; value: boolean | null; onToggle: (checked: boolean) => void }) {
  const [checked, setChecked] = useState(value ?? false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setChecked(value ?? false);
  }, [value]);

  const handleChange = async (next: boolean) => {
    setChecked(next);
    onToggle(next);
    setLoading(true);
    try {
      await updateVerificationStep(id, next);
    } catch {
      setChecked(!next);
      onToggle(!next);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Switch
      variant="compact"
      checked={checked}
      loading={loading}
      onChange={handleChange}
    />
  );
}

export const getPartnerProgramColumns = (onToggle: (checked: boolean) => void) => [
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
    width: 170,
    render: (value: boolean | null, record: { id: number }) => (
      <VerificationSwitch id={record.id} value={value} onToggle={onToggle} />
    ),
  },
  {
    title: "Template",
    dataIndex: "template",
    key: "template",
    width: 130,
    render: () => <span className="text-sm text-slate-600">View</span>,
  },
  {
    title: "Login Template",
    dataIndex: "loginTemplate",
    key: "loginTemplate",
    width: 190,
    render: () => <span className="text-sm text-slate-600">View Login Template</span>,
  },
  {
    title: "Login Script",
    dataIndex: "loginScript",
    key: "loginScript",
    width: 170,
    render: () => <span className="text-sm text-slate-600">View Login Script</span>,
  },
];
