"use client";

import type { SelectedProgram } from "./types";

interface ProgramTabsProps {
  programs: SelectedProgram[];
  activeProgramId: number | null;
  partnerName: string;
  onSelect: (id: number) => void;
}

export default function ProgramTabs({ programs, activeProgramId, partnerName, onSelect }: ProgramTabsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {programs.map((prog) => (
        <button
          key={prog.programId}
          onClick={() => onSelect(prog.programId)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeProgramId === prog.programId
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {prog.partnerName} - {prog.programName}
        </button>
      ))}
    </div>
  );
}
