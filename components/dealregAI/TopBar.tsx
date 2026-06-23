"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/common/antd/Button";

interface TopBarProps {
  partnerName: string;
  onReset: () => void;
  onSubmit: () => void;
  onSave: () => void;
}

export default function TopBar({ partnerName, onReset, onSubmit, onSave }: TopBarProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm">
        <button className="text-slate-500 hover:text-slate-800" onClick={() => router.push("/dealRegAi")}>
          All Forms
        </button>
        <span className="text-slate-400">›</span>
        <span className="text-slate-900 font-medium">{partnerName}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={onReset}>Reset Form</Button>
        <Button variant="secondary" onClick={onSubmit}>Submit Form</Button>
        <Button variant="primary" onClick={onSave}>Save</Button>
      </div>
    </div>
  );
}
