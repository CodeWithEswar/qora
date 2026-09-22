"use client";

import * as React from "react";
import { Icon } from "@iconify/react";

interface AuditLensProps {
  activeLens: string;
  onSelectLens: (lens: string) => void;
  lensCounts: Record<string, number>;
}

export function AuditLens({
  activeLens,
  onSelectLens,
  lensCounts,
}: AuditLensProps) {
  const lenses = [
    { id: "all", label: "ALL EVENTS", icon: "solar:layers-bold" },
    { id: "access", label: "ACCESS", icon: "solar:shield-star-bold" },
    { id: "content", label: "CONTENT", icon: "solar:qr-code-bold" },
    { id: "infrastructure", label: "INFRASTRUCTURE", icon: "solar:server-square-bold" },
    { id: "billing", label: "BILLING", icon: "solar:card-bold" },
    { id: "developer", label: "DEVELOPER", icon: "solar:code-square-bold" },
  ];

  return (
    <div className="border-b border-white/[0.08] bg-[#121212] px-6 py-2 overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-1.5 min-w-max">
        <span className="text-[10px] font-mono uppercase text-[#85827B] mr-2 font-semibold tracking-wider">
          AUDIT LENS
        </span>

        {lenses.map((lens) => {
          const isSelected = activeLens === lens.id;
          const count = lensCounts[lens.id] ?? 0;

          return (
            <button
              key={lens.id}
              onClick={() => onSelectLens(lens.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                isSelected
                  ? "bg-[#1F1713] text-[#FA520F] border border-[#FA520F]/40 shadow-xs"
                  : "text-[#B8B5AD] hover:text-[#F7F4EC] hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              <Icon icon={lens.icon} className="w-3.5 h-3.5" />
              <span>{lens.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  isSelected
                    ? "bg-[#FA520F]/20 text-[#FA520F] font-bold"
                    : "bg-white/[0.06] text-[#85827B]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
